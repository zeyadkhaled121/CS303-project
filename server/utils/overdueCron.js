import cron from "node-cron";
import { db } from "../database/db.js";
import BorrowingConfig from "../config/borrowingConfig.js";
import { sendEmail } from "./sendEmail.js";
import { generateOverdueWarningEmailTemplate } from "./emailTemplates.js";
import { createInAppNotification } from "./notificationService.js";


// Helper: Create audit log (non-blocking)
const createAuditLog = async (auditData) => {
  try {
    await db.collection(BorrowingConfig.COLLECTIONS.AUDIT_LOGS).add({
      ...auditData,
      timestamp: new Date(),
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Audit log write failed (overdue cron):", error.message);
    // Don't throw - audit logs are non-blocking
  }
};

// Main overdue marking function
export const markOverdueBooks = async () => {
  const startTime = new Date();
  console.log(`[Overdue Cron] Started at ${startTime.toISOString()}`);

  try {
    // Step 1: Find all Borrowed records
    // Changed to prevent Firestore 'Missing Index' error (Firestore fails on equality + inequality queries combined)
    const query = db
      .collection(BorrowingConfig.COLLECTIONS.BORROW)
      .where("status", "==", BorrowingConfig.BORROW_STATUSES.BORROWED);

    const snapshot = await query.get();
    
    // Step 1.5: Manually filter dueDate on the server instead of DB to bypass index restriction
    const nowFilter = new Date();
    const overdueDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      if (!data.dueDate) return false;
      // Handle Firebase timestamp or Date
      const dueDateJS = data.dueDate._seconds ? new Date(data.dueDate._seconds * 1000) : new Date(data.dueDate);
      return dueDateJS < nowFilter;
    });

    console.log(`[Overdue Cron] Found ${snapshot.size} borrowed records, ${overdueDocs.length} are overdue`);

    if (overdueDocs.length === 0) {
      console.log("[Overdue Cron] No overdue records to process");
      return { processed: 0, failed: 0 };
    }

    // Step 2: Process in batches (Bug 5 fix: 2 WriteBatches)
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

        // Double-check it's actually overdue (in case of timing issues)
        if (new Date(borrowData.dueDate) >= now) {
          console.warn(
            `[Overdue Cron] Record ${doc.id} is not actually overdue, skipping`
          );
          continue;
        }

        // Add to borrow batch
        borrowBatch.update(doc.ref, {
          status: BorrowingConfig.BORROW_STATUSES.OVERDUE,
          updatedAt: now
        });
        borrowBatchCount++;

        // Add to audit batch
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

        // Check if batches are at limit
        if (borrowBatchCount >= BorrowingConfig.FIRESTORE_BATCH_LIMIT) {
          console.log(
            `[Overdue Cron] Committing batch 1: ${borrowBatchCount} borrow records`
          );
          await borrowBatch.commit();
          borrowBatch = db.batch();
          borrowBatchCount = 0;
        }

        if (auditBatchCount >= BorrowingConfig.FIRESTORE_BATCH_LIMIT) {
          console.log(
            `[Overdue Cron] Committing batch 2: ${auditBatchCount} audit records`
          );
          await auditBatch.commit();
          auditBatch = db.batch();
          auditBatchCount = 0;
        }
      } catch (error) {
        console.error(
          `[Overdue Cron] Error processing record ${doc.id}:`,
          error.message
        );
        failedCount++;
        // Continue with next record (don't crash entire job)
      }
    }

    // Step 3: Commit remaining batches
    if (borrowBatchCount > 0) {
      console.log(
        `[Overdue Cron] Committing final borrow batch: ${borrowBatchCount} records`
      );
      await borrowBatch.commit();
    }

    if (auditBatchCount > 0) {
      console.log(
        `[Overdue Cron] Committing final audit batch: ${auditBatchCount} records`
      );
      await auditBatch.commit();
    }

    // Step 4: Send notifications (Bug 6: non-blocking, try/catch per notification)
    console.log(`[Overdue Cron] Sending notifications...`);
    let notificationCount = 0;

    for (const doc of overdueDocs) {
      try {
        const borrowData = doc.data();

        // Fire-and-forget notification (Bug 6)
        await createInAppNotification({
          userId: borrowData.user_id,
          type: BorrowingConfig.NOTIFICATION_TYPES.BORROW_OVERDUE,
          title: "Book Overdue",
          message: `"${borrowData.bookTitle}" is now overdue. Please return immediately to avoid penalties.`,
          borrowId: doc.id,
          bookId: borrowData.book_id,
          actionUrl: "/my-borrowings"
        }).catch((err) => {
          console.warn(
            `[Overdue Cron] Notification failed for user ${borrowData.user_id}:`,
            err.message
          );
        });

        // Notify user via Email
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
        console.error(
          `[Overdue Cron] Error sending notification for record ${doc.id}:`,
          error.message
        );
        // Continue with next notification (don't crash job)
      }
    }

    const endTime = new Date();
    const duration = endTime - startTime;

    console.log("[Overdue Cron] Completed successfully");
    console.log(
      `[Overdue Cron] Processed: ${processedCount}, Failed: ${failedCount}, Notifications: ${notificationCount}`
    );
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

// Initialize and start cron job
export const initializeOverdueCron = () => {
  try {
    // Schedule job to run every minute
    // Cron format: second minute hour day month weekday
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

