import cron from "node-cron";
import { db } from "../database/db.js";
import BorrowingConfig from "../config/borrowingConfig.js";
import { sendEmail } from "./sendEmail.js";
import { generateOverdueWarningEmailTemplate, generateFineWarningEmailTemplate, generateBanNoticeEmailTemplate } from "./emailTemplates.js";
import { createInAppNotification } from "./notificationService.js";


const createAuditLog = async (auditData) => {
  try {
    await db.collection(BorrowingConfig.COLLECTIONS.AUDIT_LOGS).add({
      ...auditData,
      timestamp: new Date(),
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Audit log write failed (overdue cron):", error.message);
  }
};

export const markOverdueBooks = async () => {
  const startTime = new Date();
  console.log(`[Overdue Cron] Started at ${startTime.toISOString()}`);

  try {
    const query = db.collection(BorrowingConfig.COLLECTIONS.BORROW);

    const snapshot = await query.get();
    
    const nowFilter = new Date();
    const overdueDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      if (data.status !== BorrowingConfig.BORROW_STATUSES.BORROWED && data.status !== BorrowingConfig.BORROW_STATUSES.OVERDUE) return false;
      if (data.fineProcessed) return false;
      if (!data.dueDate) return false;
      const dueDateJS = data.dueDate._seconds ? new Date(data.dueDate._seconds * 1000) : new Date(data.dueDate);
      return dueDateJS < nowFilter;
    });

    console.log(`[Overdue Cron] Found ${snapshot.size} borrowed records, ${overdueDocs.length} are overdue`);

    if (overdueDocs.length === 0) {
      console.log("[Overdue Cron] No overdue records to process");
      return { processed: 0, failed: 0 };
    }

    let processedCount = 0;
    let failedCount = 0;
    let notificationQueue = []; // Accumulate notifications to send post-transaction

    for (const doc of overdueDocs) {
      try {
        const borrowData = doc.data();
        const now = new Date();

        if (new Date(borrowData.dueDate) >= now) continue;

        await db.runTransaction(async (transaction) => {
          const userRef = db.collection("users").doc(borrowData.user_id);
          const userDoc = await transaction.get(userRef);

          if (!userDoc.exists) throw new Error("User not found");

          let userData = userDoc.data();
          let offenseCount = (userData.offenseCount || 0) + 1;
          
          let currentFineAmount = 0;
          let isBanned = userData.isBanned || false;
          let isFineRestricted = userData.isFineRestricted || false;

          if (offenseCount === 1) {
            currentFineAmount = 50;
            isFineRestricted = true;
          } else if (offenseCount === 2) {
            currentFineAmount = 100;
            isFineRestricted = true;
          } else if (offenseCount >= 3) {
            isBanned = true;
            isFineRestricted = true;
            currentFineAmount = 0; // Third offense results in ban
          }

          let fines = (userData.fines || 0) + currentFineAmount; 

          transaction.update(userRef, {
            offenseCount,
            fines,
            isBanned,
            isFineRestricted
          });

          if (currentFineAmount > 0) {
            const fineRef = db.collection("fines").doc();
            transaction.set(fineRef, {
              userId: borrowData.user_id,
              amount: currentFineAmount,
              status: "unpaid",
              createdAt: now,
              reason: `Overdue book: ${borrowData.bookTitle} (Offense #${offenseCount})`
            });
          }

          transaction.update(doc.ref, {
            status: BorrowingConfig.BORROW_STATUSES.OVERDUE,
            fineProcessed: true,
            updatedAt: now
          });

          const auditRef = db.collection(BorrowingConfig.COLLECTIONS.AUDIT_LOGS).doc();
          transaction.set(auditRef, {
            action: BorrowingConfig.AUDIT_ACTIONS.AUTO_OVERDUE,
            userId: borrowData.user_id,
            targetId: doc.id,
            targetType: "BORROW",
            details: {
              bookId: borrowData.book_id,
              bookTitle: borrowData.bookTitle,
              dueDate: borrowData.dueDate,
              daysOverdue: Math.floor(
                (now - new Date(borrowData.dueDate)) / (1000 * 60 * 60 * 24)
              ),
              fineAdded: currentFineAmount,
              newTotalFines: fines
            },
            timestamp: now,
            createdAt: now
          });

          // Queue notifications
          notificationQueue.push({
            borrowData,
            docId: doc.id,
            newFine: currentFineAmount,
            totalFines: fines,
            isBanned
          });
        });

        processedCount++;
      } catch (error) {
        console.error(`[Overdue Cron] Error processing record ${doc.id}:`, error.message);
        failedCount++;
      }
    }

    console.log(`[Overdue Cron] Sending notifications...`);
    let notificationCount = 0;

    for (const item of notificationQueue) {
      try {
        const { borrowData, docId, newFine, totalFines, isBanned } = item;

        await createInAppNotification({
          userId: borrowData.user_id,
          type: BorrowingConfig.NOTIFICATION_TYPES.BORROW_OVERDUE,
          title: "Book Overdue & Fine Assessed",
          message: `"${borrowData.bookTitle}" is overdue. A fine of EGP ${newFine} was added.`,
          borrowId: docId,
          bookId: borrowData.book_id,
          actionUrl: "/my-borrowings"
        }).catch((err) => {
          console.warn(`[Overdue Cron] Notification failed for user ${borrowData.user_id}:`, err.message);
        });

        if (borrowData.userEmail) {
          try {
            const formattedDueDate = borrowData.dueDate && borrowData.dueDate._seconds ? new Date(borrowData.dueDate._seconds * 1000) : new Date(borrowData.dueDate);
            const overdueHtml = generateOverdueWarningEmailTemplate(borrowData.bookTitle, formattedDueDate);
            const fineHtml = generateFineWarningEmailTemplate(newFine, totalFines);
            
            await sendEmail({
              email: borrowData.userEmail,
              subject: `URGENT: "${borrowData.bookTitle}" is Overdue!`,
              message: overdueHtml + "<hr/>" + fineHtml,
            });

            if (isBanned) {
              await sendEmail({
                email: borrowData.userEmail,
                subject: `ACCOUNT BANNED due to infractions`,
                message: generateBanNoticeEmailTemplate(),
              });
            }
          } catch (emailError) {
            console.warn(`[Overdue Cron] Email failed for user ${borrowData.userEmail}:`, emailError.message);
          }
        }

        notificationCount++;
      } catch (error) {
        console.error(`[Overdue Cron] Error sending notification for record ${doc.id}:`, error.message);
      }
    }

    const endTime = new Date();
    const duration = endTime - startTime;

    console.log("[Overdue Cron] Completed successfully");
    console.log(`[Overdue Cron] Processed: ${processedCount}, Failed: ${failedCount}, Notifications: ${notificationCount}`);
    console.log(`[Overdue Cron] Duration: ${duration}ms`);

    return {
      success: true,
      processed: processedCount,
      failed: failedCount,
      notifications: notificationCount,
      duration
    };
  } catch (error) {
    console.error("[Overdue Cron] FATAL ERROR:", error);
    return {
      success: false,
      error: error.message,
      processed: 0,
      failed: 0
    };
  }
};

export const initializeOverdueCron = () => {
  try {
    const job = cron.schedule("0 * * * * *", async () => {
      console.log("\n[Overdue Cron] Scheduled task triggered");
      await markOverdueBooks();
    });

    console.log("[Overdue Cron] Job scheduled to run every minute");

    return job;
  } catch (error) {
    console.error("[Overdue Cron] Failed to initialize:", error);
    return null;
  }
};

export default {
  markOverdueBooks,
  initializeOverdueCron
};

