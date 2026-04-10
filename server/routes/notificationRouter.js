import express from "express";
import {
  streamNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../controllers/notificationController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();


// ===== GET NOTIFICATIONS =====

// 0. Stream real-time notification events (SSE)
router.get(
  "/stream",
  isAuthenticatedUser,
  streamNotifications
);

// 1. Get all notifications with pagination
router.get(
  "/",
  isAuthenticatedUser,
  getNotifications
);

// 2. Get unread notification count (for badge)
router.get(
  "/unread-count",
  isAuthenticatedUser,
  getUnreadCount
);

// ===== MARK AS READ =====

// 3. Mark specific notification as read
router.put(
  "/:id/read",
  isAuthenticatedUser,
  markAsRead
);

// 4. Mark all notifications as read
router.put(
  "/read-all",
  isAuthenticatedUser,
  markAllAsRead
);

// ===== DELETE =====

// 5. Delete specific notification
router.delete(
  "/:id",
  isAuthenticatedUser,
  deleteNotification
);

// 6. Delete all notifications
router.delete(
  "/",
  isAuthenticatedUser,
  deleteAllNotifications
);

export default router;

