import cron from "node-cron";
import { db } from "../database/db.js";
import BorrowingConfig from "../config/borrowingConfig.js";
import { sendEmail } from "./sendEmail.js";
import { generateOverdueWarningEmailTemplate } from "./emailTemplates.js";
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
    const query = db
      .collection(BorrowingConfig.COLLECTIONS.BORROW)
      .where("status", "==", BorrowingConfig.BORROW_STATUSES.BORROWED);

    const snapshot = await query.get();
    
    const nowFilter = new Date();
    const overdueDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      if (!data.dueDate) return false;
      const dueDateJS = data.dueDate._seconds ? new Date(data.dueDate._seconds * 1000) : new Date(data.dueDate);
      return dueDateJS < nowFilter;
    });

    console.log(`[Overdue Cron] Found ${snapshot.size} borrowed records, ${overdueDocs.length} are overdue`);

    if (overdueDocs.length === 0) {
      console.log("[Overdue Cron] No overdue records to process");
      return { processed: 0, failed: 0 };
    }

    let borrowBatch = db.batch();
    let auditBatch = db.batch();
    let borrowBatchCount = 0;
    let auditBatchCount = 0;
    let processedCount = 0;
    let failedCount = 0;

    for (const doc of overdueDocs) {
      try {
        const borrowData = doc.data();
        const now = new Date();

        if (new Date(borrowData.dueDate) >= now) continue;

        borrowBatch.update(doc.ref, {
          status: BorrowingConfig.BORROW_STATUSES.OVERDUE,
          updatedAt: now
        });
        borrowBatchCount++;

        auditBatch.set(
          db.collection(BorrowingConfig.COLLECTIONS.AUDIT_LOGS).doc(),
          {
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
              )
            },
            timestamp: now,
            createdAt: now
          }
        );
        auditBatchCount++;

        processedCount++;

        if (borrowBatchCount >= BorrowingConfig.FIRESTORE_BATCH_LIMIT) {
          console.log(`[Overdue Cron] Committing batch 1: ${borrowBatchCount} borrow records`);
          await borrowBatch.commit();
          borrowBatch = db.batch();
          borrowBatchCount = 0;
        }

        if (auditBatchCount >= BorrowingConfig.FIRESTORE_BATCH_LIMIT) {
          console.log(`[Overdue Cron] Committing batch 2: ${auditBatchCount} audit records`);
          await auditBatch.commit();
          auditBatch = db.batch();
          auditBatchCount = 0;
        }
      } catch (error) {
        console.error(`[Overdue Cron] Error processing record ${doc.id}:`, error.message);
        failedCount++;
      }
    }

    if (borrowBatchCount > 0) {
      console.log(`[Overdue Cron] Committing final borrow batch: ${borrowBatchCount} records`);
      await borrowBatch.commit();
    }

    if (auditBatchCount > 0) {
      console.log(`[Overdue Cron] Committing final audit batch: ${auditBatchCount} records`);
      await auditBatch.commit();
    }

    console.log(`[Overdue Cron] Sending notifications...`);
    let notificationCount = 0;

    for (const doc of overdueDocs) {
      try {
        const borrowData = doc.data();

        await createInAppNotification({
          userId: borrowData.user_id,
          type: BorrowingConfig.NOTIFICATION_TYPES.BORROW_OVERDUE,
          title: "Book Overdue",
          message: `"${borrowData.bookTitle}" is now overdue. Please return immediately to avoid penalties.`,
          borrowId: doc.id,
          bookId: borrowData.book_id,
          actionUrl: "/my-borrowings"
        }).catch((err) => {
          console.warn(`[Overdue Cron] Notification failed for user ${borrowData.user_id}:`, err.message);
        });

        if (borrowData.userEmail) {
          try {
            const formattedDueDate = borrowData.dueDate && borrowData.dueDate._seconds ? new Date(borrowData.dueDate._seconds * 1000) : new Date(borrowData.dueDate);
            const emailHtml = generateOverdueWarningEmailTemplate(borrowData.bookTitle, formattedDueDate);
            await sendEmail({
              email: borrowData.userEmail,
              subject: `URGENT: "${borrowData.bookTitle}" is Overdue!`,
              message: emailHtml,
            });
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

