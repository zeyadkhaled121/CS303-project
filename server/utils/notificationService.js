import { db } from "../database/db.js";
import { publishNotificationEvent } from "./notificationRealtime.js";

const DEFAULT_RETENTION_DAYS = 30;

export const createInAppNotification = async (notificationData, retentionDays = DEFAULT_RETENTION_DAYS) => {
  try {
    if (!notificationData?.userId || typeof notificationData.userId !== "string") {
      console.error("Invalid notification: missing or invalid userId", notificationData);
      return null;
    }

    if (!notificationData.type) {
      console.error("Invalid notification: missing type", notificationData);
      return null;
    }

    const now = new Date();
    const result = await db.collection("notifications").add({
      ...notificationData,
      read: false,
      createdAt: now,
      expiresAt: new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000)
    });

    publishNotificationEvent(notificationData.userId, "notification_changed", {
      reason: "created",
      notificationId: result.id
    });

    return result;
  } catch (error) {
    console.error("Notification creation failed:", error);
    return null;
  }
};
