import { db } from "../database/db.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { createInAppNotification } from "../utils/notificationService.js";

export const getFines = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const snapshot = await db.collection("fines").where("userId", "==", userId).get();
  const fines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, fines });
});

export const getAllFines = catchAsyncErrors(async (req, res, next) => {
  const { status, userId } = req.query;
  let query = db.collection("fines");
  if (status) query = query.where("status", "==", status);
  if (userId) query = query.where("userId", "==", userId);
  
  const snapshot = await query.get();
  const finesRaw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const fines = await Promise.all(finesRaw.map(async (fine) => {
    let userName = "Unknown";
    let userEmail = "N/A";
    
    if (fine.userId) {
      try {
        const userDoc = await db.collection("users").doc(fine.userId).get();
        if (userDoc.exists) {
          const uData = userDoc.data();
          userName = uData.name || uData.displayName || "Unknown User";
          userEmail = uData.email || "N/A";
        }
      } catch (err) {
        console.error("Failed to fetch user for fine:", fine.userId);
      }
    }
    return { ...fine, userName, userEmail };
  }));

  res.status(200).json({ success: true, fines });
});

export const confirmFinePayment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user.id;

  await db.runTransaction(async (t) => {
    const fineRef = db.collection("fines").doc(id);
    const fineDoc = await t.get(fineRef);
    if (!fineDoc.exists) throw new ErrorHandler("Fine not found", 404);
    
    const fineData = fineDoc.data();
    if (fineData.status === "paid") throw new ErrorHandler("Fine is already paid", 400);

    const userRef = db.collection("users").doc(fineData.userId);
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) throw new ErrorHandler("User not found", 404);

    const userData = userDoc.data();
    const newBalance = Math.max(0, (userData.fines || 0) - fineData.amount);
    const isStillRestricted = newBalance > 0;

    t.update(fineRef, {
      status: "paid",
      paidAt: new Date(),
      confirmedBy: adminId
    });

    t.update(userRef, {
      fines: newBalance,
      isFineRestricted: isStillRestricted
    });

    if (!isStillRestricted && userData.isFineRestricted) {
      const notificationRef = db.collection("notifications").doc();
      t.set(notificationRef, {
        userId: userData.uid || fineData.userId,
        message: "Your fines have been cleared. Borrowing restrictions are lifted.",
        type: "restriction_lifted",
        isRead: false,
        createdAt: new Date()
      });
    }
  });

  res.status(200).json({ success: true, message: "Payment confirmed successfully" });
});

export const unbanUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userRef = db.collection("users").doc(id);
  const finesQuery = await db.collection("fines").where("userId", "==", id).where("status", "==", "unpaid").get();

  await db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) throw new ErrorHandler("User not found", 404);

    t.update(userRef, { 
      isBanned: false,
      offenseCount: 0,
      fines: 0,
      isFineRestricted: false
    });

    finesQuery.docs.forEach(fineDoc => {
      t.update(fineDoc.ref, { status: "paid", paidAt: new Date(), confirmedBy: req.user.id });
    });

    const notificationRef = db.collection("notifications").doc();
    t.set(notificationRef, {
      userId: id,
      message: "Your account ban has been lifted.",
      type: "ban_lifted",
      isRead: false,
      createdAt: new Date()
    });
  });

  res.status(200).json({ success: true, message: "User unbanned successfully" });
});

export const getUserOffenses = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const userDoc = await db.collection("users").doc(id).get();
  if (!userDoc.exists) return next(new ErrorHandler("User not found", 404));

  const finesSnapshot = await db.collection("fines").where("userId", "==", id).get();
  const borrowsSnapshot = await db.collection("borrow").where("user_id", "==", id).get();

  res.status(200).json({
    success: true,
    user: { id: userDoc.id, ...userDoc.data() },
    fines: finesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    borrowings: borrowsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
});

export const getBannedUsers = catchAsyncErrors(async (req, res, next) => {
  const snapshot = await db.collection("users").where("isBanned", "==", true).get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, users });
});
