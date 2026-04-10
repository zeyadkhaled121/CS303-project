import { db } from "../database/db.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import {
  addNotificationClient,
  removeNotificationClient,
  publishNotificationEvent,
  publishHeartbeat
} from "../utils/notificationRealtime.js";



// ===== 0. STREAM USER NOTIFICATIONS (SSE) =====
export const streamNotifications = catchAsyncErrors(async (req, res) => {
  const userId = req.user.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  addNotificationClient(userId, res);

  res.write(`event: connected\ndata: ${JSON.stringify({ userId, ts: Date.now() })}\n\n`);

  const heartbeat = setInterval(() => {
    publishHeartbeat(res);
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeNotificationClient(userId, res);
    try {
      res.end();
    } catch {
      // no-op
    }
  });
});

// ===== 1. GET USER NOTIFICATIONS =====
export const getNotifications = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { unreadOnly = false, skip = 0, limit = 10 } = req.query;

  try {
    let query = db.collection("notifications").where("userId", "==", userId);

    // Filter: only unread if requested
    if (unreadOnly === "true" || unreadOnly === true) {
      query = query.where("read", "==", false);
    }

    // Get total count BEFORE pagination 
    const baseQuery = db.collection("notifications").where("userId", "==", userId);
   
    const [unreadSnap] = await Promise.all([
      baseQuery.where("read", "==", false).count().get()
    ]);

    const total = 0; 
    const unreadCount = unreadSnap.data().count;

    // Apply pagination and ordering
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .offset(parseInt(skip))
      .limit(parseInt(limit))
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications,
        total,
        unreadCount,
        skip: parseInt(skip),
        limit: parseInt(limit)
      },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 2. GET UNREAD NOTIFICATION COUNT =====
export const getUnreadCount = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .count()
      .get();

    const unreadCount = snapshot.data().count;

    res.status(200).json({
      success: true,
      message: "Unread count fetched",
      data: { unreadCount },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 3. MARK NOTIFICATION AS READ =====
export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notificationRef = db.collection("notifications").doc(id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return next(new ErrorHandler("Notification not found", 404));
    }

    const notificationData = notificationDoc.data();

    if (notificationData.userId !== userId) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    // Update notification
    await notificationRef.update({
      read: true,
      readAt: new Date()
    });

    publishNotificationEvent(userId, "notification_changed", {
      reason: "read",
      notificationId: id
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: null,
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 4. MARK ALL NOTIFICATIONS AS READ =====
export const markAllAsRead = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: "No unread notifications to mark",
        data: { markedCount: 0 },
        error: null
      });
    }

    const batches = [];
    let currentBatch = db.batch();
    let currentBatchSize = 0;
    
    snapshot.docs.forEach((doc) => {
      currentBatch.update(doc.ref, {
        read: true,
        readAt: new Date()
      });
      currentBatchSize++;
      
      if (currentBatchSize === 500) {
        batches.push(currentBatch.commit());
        currentBatch = db.batch();
        currentBatchSize = 0;
      }
    });

    if (currentBatchSize > 0) {
      batches.push(currentBatch.commit());
    }

    await Promise.all(batches);

    publishNotificationEvent(userId, "notification_changed", {
      reason: "read_all"
    });

    res.status(200).json({
      success: true,
      message: `Marked ${snapshot.size} notifications as read`,
      data: { markedCount: snapshot.size },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 5. DELETE NOTIFICATION =====
export const deleteNotification = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notificationRef = db.collection("notifications").doc(id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return next(new ErrorHandler("Notification not found", 404));
    }

    const notificationData = notificationDoc.data();

    if (notificationData.userId !== userId) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    // Delete notification
    await notificationRef.delete();

    publishNotificationEvent(userId, "notification_changed", {
      reason: "deleted",
      notificationId: id
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted",
      data: null,
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 6. DELETE ALL NOTIFICATIONS =====
export const deleteAllNotifications = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: "No notifications to delete",
        data: { deletedCount: 0 },
        error: null
      });
    }

    const batches = [];
    let currentBatch = db.batch();
    let currentBatchSize = 0;

    snapshot.docs.forEach((doc) => {
      currentBatch.delete(doc.ref);
      currentBatchSize++;

      if (currentBatchSize === 500) {
        batches.push(currentBatch.commit());
        currentBatch = db.batch();
        currentBatchSize = 0;
      }
    });

    if (currentBatchSize > 0) {
      batches.push(currentBatch.commit());
    }

    await Promise.all(batches);

    publishNotificationEvent(userId, "notification_changed", {
      reason: "deleted_all"
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${snapshot.size} notifications`,
      data: { deletedCount: snapshot.size },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export default {
  streamNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};


