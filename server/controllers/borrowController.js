import { db } from "../database/db.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { createInAppNotification } from "../utils/notificationService.js";

const createAuditLog = async (auditData) => {
  try {
    await db.collection("auditLogs").add({
      ...auditData,
      timestamp: new Date(),
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
};

//  Get Admin Name for Notifications =====
const getAdminName = async (adminId) => {
  try {
    const adminDoc = await db.collection("users").doc(adminId).get();
    return adminDoc.exists ? adminDoc.data().name || "Admin" : "Admin";
  } catch (error) {
    console.error("Failed to fetch admin name:", error);
    return "Admin";
  }
};

const isAdminLikeRole = (roleValue) => {
  const normalizedRole = String(roleValue || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  return normalizedRole === "admin" || normalizedRole === "superadmin";
};


// ===== 1. REQUEST BORROW =====
export const requestBorrow = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.body;
  const userId = req.user.id;
  const { name: userName, email: userEmail } = req.user;

  // Validation
  if (!bookId) {
    return next(new ErrorHandler("Book ID is required", 400));
  }

  // ===== BLOCK OVERDUE USERS =====
  const userDocRef = await db.collection("users").doc(userId).get();
  if (userDocRef.exists) {
    const userData = userDocRef.data();
    if (userData.isBanned) {
      return next(new ErrorHandler("ACCOUNT BANNED: You cannot borrow books due to multiple offenses or excessive fines.", 403));
    }
    if (userData.isFineRestricted) {
      return next(new ErrorHandler("ACCOUNT RESTRICTED: Please pay your outstanding fines to resume borrowing.", 403));
    }
  }

  const overdueSnapshot = await db.collection("borrow")
    .where("user_id", "==", userId)
    .where("status", "==", "Overdue")
    .limit(1)
    .get();

  if (!overdueSnapshot.empty) {
    return next(new ErrorHandler("ACCOUNT BLOCKED: You have overdue items. You cannot borrow new books until you return them.", 403));
  }

  // ===== 3 BOOKS LIMIT =====
  const activeBorrowsSnapshot = await db.collection("borrow")
    .where("user_id", "==", userId)
    .where("status", "in", ["Pending", "Borrowed", "Overdue"])
    .get();
      
  if (activeBorrowsSnapshot.size >= 3) {
    return next(new ErrorHandler("BORROW LIMIT REACHED: You can only have up to 3 active books (Requests + Borrowed) at the same time.", 403));
  }

  let newBorrowId;
  let bookDataForAudit; 

  try {
    newBorrowId = await db.runTransaction(async (transaction) => {
      // 1. Check for existing active request (inside transaction - Bug 7)
      const duplicateSnapshot = await transaction.get(
        db.collection("borrow")
          .where("user_id", "==", userId)
          .where("book_id", "==", bookId)
          .where("status", "in", ["Pending", "Borrowed", "Overdue"])
      );

      if (!duplicateSnapshot.empty) {
        throw new Error("You already have an active request for this book");
      }

      // 2. Get book and check availability
      const bookRef = db.collection("books").doc(bookId);
      const bookDoc = await transaction.get(bookRef);

      if (!bookDoc.exists) {
        throw new Error("Book not found");
      }

      const bookData = bookDoc.data();
      bookDataForAudit = bookData; 

      if (!bookData.availableCopies || bookData.availableCopies <= 0) {
        throw new Error("No copies available for borrowing");
      }

      // 3. Decrement availableCopies (inside transaction)
      transaction.update(bookRef, {
        availableCopies: bookData.availableCopies - 1,
        updatedAt: new Date()
      });

      // 4. Create borrow record (inside transaction)
      const newBorrowRef = db.collection("borrow").doc();
      transaction.set(newBorrowRef, {
        user_id: userId,
        userName: userName,
        userEmail: userEmail,
        book_id: bookId,
        bookTitle: bookData.title,
        bookAuthor: bookData.author,
        bookImage: bookData.image,
        bookTotalCopies: bookData.totalCopies,
        bookAvailableCopies: bookData.availableCopies - 1,
        status: "Pending",
        requestDate: new Date(),
        dueDate: null,
        returnDate: null,
        approvedBy: null,
        remarks: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newBorrowRef.id;
    });

    
    await createAuditLog({
      action: "BORROW_REQUEST",
      userId,
      targetId: newBorrowId,
      targetType: "BORROW",
      details: { bookId, bookTitle: bookDataForAudit.title }
    });

    await createInAppNotification({
      userId,
      type: "BORROW_REQUESTED",
      title: "Request Submitted",
      message: `Your request for "${bookDataForAudit.title}" has been submitted. Waiting for admin approval.`,
      borrowId: newBorrowId,
      bookId,
      actionUrl: "/my-borrowings"
    });

      // Notify all admin-level users (Admin + Super Admin) of the new request.
      try {
        const ADMIN_NOTIFICATION_ROLES = ["Admin", "Super Admin", "admin", "super admin", "superadmin"];
        const directRoleSnapshot = await db
          .collection("users")
          .where("role", "in", ADMIN_NOTIFICATION_ROLES)
          .get();

        let adminDocs = directRoleSnapshot.docs;

        if (adminDocs.length === 0) {
          const verifiedUsersSnapshot = await db
            .collection("users")
            .where("accountVerified", "==", true)
            .get();

          adminDocs = verifiedUsersSnapshot.docs.filter((doc) => {
            const data = doc.data() || {};
            return isAdminLikeRole(data.role);
          });
        }

        const notificationPromises = adminDocs
          .filter((adminDoc) => {
            const adminData = adminDoc.data() || {};
            return adminDoc.id !== userId && adminData.accountVerified !== false;
          })
          .map((adminDoc) => {
            return createInAppNotification({
              userId: adminDoc.id,
              type: "ADMIN_ALERT_NEW_REQUEST",
              title: "New Borrow Request",
              message: `${userName} has requested to borrow "${bookDataForAudit.title}".`,
              actionUrl: "/admin/borrowLogistics",
              borrowId: newBorrowId,
              bookId,
              actionRequired: true,
              severity: "info"
            });
          });

        if (notificationPromises.length > 0) {
          await Promise.all(notificationPromises);
        } else {
          console.warn("No eligible admin recipients found for BORROW_REQUEST notification", {
            borrowId: newBorrowId,
            requesterId: userId,
            requesterEmail: userEmail
          });
        }
      } catch (adminNotifError) {
        console.error("Failed to send admin notifications for new borrow request:", adminNotifError);
      }

      res.status(201).json({
        success: true,
        message: "Borrow request created successfully",
        data: { borrowId: newBorrowId },
        error: null
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });

// ===== 2. GET MY BORROWINGS =====
export const getMyBorrowings = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { status, skip = 0, limit = 10 } = req.query;

  try {
    const VALID_BORROW_STATUSES = ["Pending", "Borrowed", "Overdue", "Returned", "Lost", "Rejected", "Cancelled"];
    if (status && !VALID_BORROW_STATUSES.includes(status)) {
      return next(new ErrorHandler(`Invalid status. Must be one of: ${VALID_BORROW_STATUSES.join(", ")}`, 400));
    }

    let query = db.collection("borrow").where("user_id", "==", userId);

    if (status) {
      query = query.where("status", "==", status);
    }

    // Get total count BEFORE pagination 
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Apply pagination after counting
    const snapshot = await query
      .orderBy("requestDate", "desc")
      .offset(parseInt(skip))
      .limit(parseInt(limit))
      .get();

    const borrowings = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      message: "Borrowings fetched successfully",
      data: { borrowings, total },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 3. CANCEL BORROW REQUEST =====
export const cancelBorrow = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  let bookIdForAudit; 

  try {
    await db.runTransaction(async (transaction) => {
      const borrowRef = db.collection("borrow").doc(id);
      const borrowDoc = await transaction.get(borrowRef);

      if (!borrowDoc.exists) {
        throw new Error("Borrow record not found");
      }

      const borrowData = borrowDoc.data();
      bookIdForAudit = borrowData.book_id;

      // Only user who created the request can cancel
      if (borrowData.user_id !== userId) {
        throw new Error("Unauthorized");
      }

      // Check status INSIDE transaction to prevent race conditions
      if (borrowData.status !== "Pending") {
        throw new Error("Only Pending requests can be cancelled");
      }

      const bookRef = db.collection("books").doc(borrowData.book_id);
      const bookDoc = await transaction.get(bookRef);
      
      // Update borrow status
      transaction.update(borrowRef, {
        status: "Cancelled",
        updatedAt: new Date()
      });

      // Restore available copy 
      if (bookDoc.exists) {
        const currentCopies = bookDoc.data().availableCopies;
        const totalCopies = bookDoc.data().totalCopies;
        const newAvailable = Math.min(totalCopies, currentCopies + 1);
        
        transaction.update(bookRef, {
          availableCopies: newAvailable,
          status: newAvailable > 0 ? "Available" : "Borrowed",
          updatedAt: new Date()
        });
      }
    });

    // Audit log
    await createAuditLog({
      action: "BORROW_CANCELLED",
      userId,
      targetId: id,
      targetType: "BORROW",
      details: { bookId: bookIdForAudit }
    });

    res.status(200).json({
      success: true,
      message: "Borrow request cancelled",
      data: null,
      error: null
    });
  } catch (error) {
    if (error.message === "Unauthorized") return next(new ErrorHandler(error.message, 403));
    if (error.message === "Borrow record not found") return next(new ErrorHandler(error.message, 404));
    return next(new ErrorHandler(error.message, 400));
  }
});

// ===== 4. GET ALL BORROW RECORDS (Admin) =====
export const getAllBorrowings = catchAsyncErrors(async (req, res, next) => {
  const { status, userId, skip = 0, limit = 10 } = req.query;

  try {
    const VALID_BORROW_STATUSES = ["Pending", "Borrowed", "Overdue", "Returned", "Lost", "Rejected", "Cancelled"];
    if (status && !VALID_BORROW_STATUSES.includes(status)) {
      return next(new ErrorHandler(`Invalid status. Must be one of: ${VALID_BORROW_STATUSES.join(", ")}`, 400));
    }

    let query = db.collection("borrow");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (userId) {
      query = query.where("user_id", "==", userId);
    }

    // Get total count BEFORE pagination 
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Apply pagination after counting
    const snapshot = await query
      .orderBy("requestDate", "desc")
      .offset(parseInt(skip))
      .limit(parseInt(limit))
      .get();

    const borrowings = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      message: "All borrowings fetched",
      data: { borrowings, total },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ===== 4 RECORD DIRECT BORROW =====
// Admin assigns a book directly to a user
export const recordDirectBorrow = catchAsyncErrors(async (req, res, next) => {
  const { userId, bookId, dueDate } = req.body;
  const adminId = req.user.id;

  if (!userId || !bookId || !dueDate) {
    return next(new ErrorHandler("User ID, Book ID, and due date are required", 400));
  }

  const dueDateObj = new Date(dueDate);
  const now = new Date();
    const nowWithBuffer = new Date(now.getTime() - 10 * 60000);
    if (dueDateObj <= nowWithBuffer) {
    return next(new ErrorHandler("Due date must be in the future", 400));
  }

  let newBorrowId;
  let bookDataForAudit;

  try {
    // ATOMIC TRANSACTION: Update book + borrowRecord + user
    newBorrowId = await db.runTransaction(async (transaction) => {
      // Check duplicate
      const duplicateQuery = db.collection("borrow")
        .where("user_id", "==", userId)
        .where("book_id", "==", bookId)
        .where("status", "in", ["Pending", "Borrowed", "Overdue"]);
      
      const duplicateSnapshot = await transaction.get(duplicateQuery);
      if (!duplicateSnapshot.empty) {
        throw new Error("User already has an active borrow request or record for this book");
      }

      const bookRef = db.collection("books").doc(bookId);
      const bookDoc = await transaction.get(bookRef);

      if (!bookDoc.exists) {
        throw new Error("Book not found");
      }

      bookDataForAudit = bookDoc.data();

      if (bookDataForAudit.availableCopies <= 0) {
        throw new Error("No copies available for this book");
      }

      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }
      
      const userData = userDoc.data();
      const currentBorrowed = userData.borrowedBooks || [];

      // 1. Decrement copies
      transaction.update(bookRef, {
        availableCopies: bookDataForAudit.availableCopies - 1,
        status: bookDataForAudit.availableCopies - 1 === 0 ? "Unavailable" : bookDataForAudit.status,
        updatedAt: new Date()
      });

      // 2. Create borrow record
      const borrowRef = db.collection("borrow").doc();
      const borrowData = {
        user_id: userId,
        book_id: bookId,
        bookTitle: bookDataForAudit.title,
        status: "Borrowed",
        requestDate: new Date(),
        dueDate: dueDateObj,
        approvedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      transaction.set(borrowRef, borrowData);

      // 3. Update user
      transaction.update(userRef, {
        borrowedBooks: [...currentBorrowed, bookId],
        updatedAt: new Date()
      });

      return borrowRef.id;
    });

    // AFTER transaction commits, write audit log and create notification
    await createAuditLog({
      action: "BORROW_RECORDED",
      userId: adminId,
      targetId: newBorrowId,
      targetType: "BORROW",
      details: { dueDate, bookId }
    });

    // Notify user of direct loan assignment
    await createInAppNotification({
      userId,
      type: "BORROW_APPROVED",
      title: "New Loan Assigned",
      message: `An admin assigned "${bookDataForAudit?.title}" to you. Due: ${dueDateObj.toLocaleDateString()}`,
      borrowId: newBorrowId,
      bookId,
      actionUrl: "/my-borrowings"
    });

    // Notify admin of their record creation (ADMIN NOTIFICATION SYSTEM)
    const userName = await (async () => {
      try {
        const userDoc = await db.collection("users").doc(userId).get();
        return userDoc.exists ? userDoc.data().name || "User" : "User";
      } catch {
        return "User";
      }
    })();
    await createInAppNotification({
      userId: adminId,
      type: "ADMIN_ACTION_LOAN_RECORDED",
      title: "Loan Recorded",
      message: `You recorded a direct loan of "${bookDataForAudit?.title}" to "${userName}". Due: ${dueDateObj.toLocaleDateString()}`,
      borrowId: newBorrowId,
      bookId,
      actionUrl: "/borrow/all",
      action: "BORROW_RECORDED",
      severity: "success"
    });

    res.status(201).json({
      success: true,
      message: "Direct loan recorded successfully",
      data: { borrowId: newBorrowId },
      error: null
    });
  } catch (error) {
    if (error.message === "User already has an active borrow request or record for this book") {
      return next(new ErrorHandler(error.message, 400));
    }
    return next(new ErrorHandler(error.message, 400));
  }
});

// ===== 5. APPROVE BORROW REQUEST =====
export const approveBorrow = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { dueDate } = req.body;
  const adminId = req.user.id;

  // Validation
  if (!dueDate) {
    return next(new ErrorHandler("Due date is required", 400));
  }

  const dueDateObj = new Date(dueDate);
  const now = new Date();
    const nowWithBuffer = new Date(now.getTime() - 10 * 60000);
    if (dueDateObj <= nowWithBuffer) {
    return next(new ErrorHandler("Due date must be in the future", 400));
  }

  let finalBorrowData; 

  try {
    await db.runTransaction(async (transaction) => {
      const borrowRef = db.collection("borrow").doc(id);
      const borrowDoc = await transaction.get(borrowRef);

      if (!borrowDoc.exists) {
        throw new Error("Borrow record not found");
      }

      finalBorrowData = borrowDoc.data();

      //  (prevents race condition bypass)
      if (finalBorrowData.status !== "Pending") {
        throw new Error("Only Pending requests can be approved");
      }

      const bookRef = db.collection("books").doc(finalBorrowData.book_id);
      const resolvedUserId = finalBorrowData.user_id || finalBorrowData?.user?._id || null;
      const userRef = resolvedUserId ? db.collection("users").doc(resolvedUserId) : null;

      // READS FIRST 
      const userDoc = userRef ? await transaction.get(userRef) : null;
      const currentBorrowed = userDoc?.exists ? (userDoc.data().borrowedBooks || []) : [];

      // THEN WRITES
      // 1. Update book status 
      transaction.update(bookRef, {
        status: "Borrowed",
        updatedAt: new Date()
      });

      // 2. Update borrowRecord
      transaction.update(borrowRef, {
        status: "Borrowed",
        dueDate: dueDateObj,
        approvedBy: adminId,
        updatedAt: new Date()
      });

      // 3. Update user.borrowedBooks array 
      const updatedBorrowed = currentBorrowed.includes(finalBorrowData.book_id)
        ? currentBorrowed
        : [...currentBorrowed, finalBorrowData.book_id];
      
      if (userRef && userDoc?.exists) {
        transaction.update(userRef, {
          borrowedBooks: updatedBorrowed,
          updatedAt: new Date()
        });
      }
    });

    await createAuditLog({
      action: "BORROW_APPROVED",
      userId: adminId,
      targetId: id,
      targetType: "BORROW",
      details: { dueDate, bookId: finalBorrowData.book_id }
    });

    // Notify user of approval
    await createInAppNotification({
      userId: finalBorrowData.user_id,
      type: "BORROW_APPROVED",
      title: "Book Approved",
      message: `Your request for "${finalBorrowData.bookTitle}" was approved. Due: ${dueDateObj.toLocaleDateString()}`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/my-borrowings"
    });

    // Notify admin of their action (ADMIN NOTIFICATION SYSTEM)
    await createInAppNotification({
      userId: adminId,
      type: "ADMIN_ACTION_APPROVED",
      title: "Request Approved",
      message: `You approved book request from "${finalBorrowData.userName}" for "${finalBorrowData.bookTitle}". Due: ${dueDateObj.toLocaleDateString()}`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/borrow/all",
      action: "BORROW_APPROVED",
      severity: "success"
    });

    res.status(200).json({
      success: true,
      message: "Borrow request approved",
      data: null,
      error: null
    });
  } catch (error) {
    if (error.message === "Borrow record not found") return next(new ErrorHandler(error.message, 404));
    return next(new ErrorHandler(error.message, 400));
  }
});

// ===== 6. REJECT BORROW REQUEST =====
export const rejectBorrow = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const adminId = req.user.id;

  // Validation
  if (!remarks || remarks.trim() === "") {
    return next(new ErrorHandler("Remarks are required", 400));
  }

  let finalBorrowData;

  try {
    await db.runTransaction(async (transaction) => {
      const borrowRef = db.collection("borrow").doc(id);
      const borrowDoc = await transaction.get(borrowRef);

      if (!borrowDoc.exists) {
        throw new Error("Borrow record not found");
      }

      finalBorrowData = borrowDoc.data();

      if (finalBorrowData.status !== "Pending") {
        throw new Error("Only Pending requests can be rejected");
      }

      const bookRef = db.collection("books").doc(finalBorrowData.book_id);
      const bookDoc = await transaction.get(bookRef);

      // Update borrowRecord to Rejected
      transaction.update(borrowRef, {
        status: "Rejected",
        remarks,
        updatedAt: new Date()
      });

      // Restore availableCopies 
      if (bookDoc.exists) {
        const currentCopies = bookDoc.data().availableCopies;
        const totalCopies = bookDoc.data().totalCopies;
        const newAvailable = Math.min(totalCopies, currentCopies + 1);
        
        transaction.update(bookRef, {
          availableCopies: newAvailable,
          status: newAvailable > 0 ? "Available" : "Borrowed",
          updatedAt: new Date()
        });
      }
    });

    // Audit log
    await createAuditLog({
      action: "BORROW_REJECTED",
      userId: adminId,
      targetId: id,
      targetType: "BORROW",
      details: { bookId: finalBorrowData.book_id, remarks }
    });

    // Notify user of rejection
    await createInAppNotification({
      userId: finalBorrowData.user_id,
      type: "BORROW_REJECTED",
      title: "Request Declined",
      message: `Your request for "${finalBorrowData.bookTitle}" was declined. Reason: ${remarks}`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/my-borrowings"
    });

    // Notify admin of their action (ADMIN NOTIFICATION SYSTEM)
    await createInAppNotification({
      userId: adminId,
      type: "ADMIN_ACTION_REJECTED",
      title: "Request Rejected",
      message: `You rejected book request from "${finalBorrowData.userName}" for "${finalBorrowData.bookTitle}". Reason: ${remarks}`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/borrow/all",
      action: "BORROW_REJECTED",
      severity: "warning"
    });

    res.status(200).json({
      success: true,
      message: "Borrow request rejected",
      data: null,
      error: null
    });
  } catch (error) {
    if (error.message === "Borrow record not found") return next(new ErrorHandler(error.message, 404));
    return next(new ErrorHandler(error.message, 400));
  }
});

// ===== 7. CONFIRM RETURN =====
export const confirmReturn = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user.id;

  let finalBorrowData;

  try {
    // ATOMIC TRANSACTION: Update book + borrowRecord + user (Bug 9)
    await db.runTransaction(async (transaction) => {
      const borrowRef = db.collection("borrow").doc(id);
      
      // READS FIRST
      const borrowDoc = await transaction.get(borrowRef);

      if (!borrowDoc.exists) {
        throw new Error("Borrow record not found");
      }

      finalBorrowData = borrowDoc.data();

      // Only Borrowed or Overdue can be returned
      if (!["Borrowed", "Overdue"].includes(finalBorrowData.status)) {
        throw new Error("Only Borrowed or Overdue books can be returned");
      }

      const bookRef = db.collection("books").doc(finalBorrowData.book_id);
      const resolvedUserId = finalBorrowData.user_id || finalBorrowData?.user?._id || null;
      const userRef = resolvedUserId ? db.collection("users").doc(resolvedUserId) : null;

      const bookDoc = await transaction.get(bookRef);
      const userDoc = userRef ? await transaction.get(userRef) : null; // Keep reads before writes to satisfy Firestore rules

      // CALCULATIONS
      const newAvailableCopies = bookDoc.exists ? bookDoc.data().availableCopies + 1 : 1;
      const totalCopies = bookDoc.exists ? bookDoc.data().totalCopies : 1;
      const updatedBorrowed = userDoc?.exists ? (userDoc.data().borrowedBooks || []).filter(
        bid => bid !== finalBorrowData.book_id
      ) : [];

      // WRITES
      // 1. Update book inventory only if linked book document still exists.
      // Legacy borrow rows can reference deleted books; return should still complete.
      if (bookDoc.exists) {
        transaction.update(bookRef, {
          availableCopies: newAvailableCopies,
          status: newAvailableCopies > 0 ? "Available" : "Borrowed",
          updatedAt: new Date()
        });
      }

      // 2. Update borrowRecord
      transaction.update(borrowRef, {
        status: "Returned",
        returnDate: new Date(),
        updatedAt: new Date()
      });

      // 3. Remove from user.borrowedBooks 
      if (userRef && userDoc?.exists) {
        transaction.update(userRef, {
          borrowedBooks: updatedBorrowed,
          updatedAt: new Date()
        });
      }
    });

    // AFTER transaction commits
    await createAuditLog({
      action: "BORROW_RETURNED",
      userId: adminId,
      targetId: id,
      targetType: "BORROW",
      details: { bookId: finalBorrowData.book_id }
    });

    // Notify user of return confirmation
    await createInAppNotification({
      userId: finalBorrowData.user_id,
      type: "BORROW_RETURNED",
      title: "Return Confirmed",
      message: `Your return of "${finalBorrowData.bookTitle}" has been confirmed.`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/my-borrowings"
    });

    // Notify admin of their action (ADMIN NOTIFICATION SYSTEM)
    await createInAppNotification({
      userId: adminId,
      type: "ADMIN_ACTION_RETURN_CONFIRMED",
      title: "Return Recorded",
      message: `You confirmed return of "${finalBorrowData.bookTitle}" from "${finalBorrowData.userName}".`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/borrow/all",
      action: "BORROW_RETURNED",
      severity: "info"
    });

    res.status(200).json({
      success: true,
      message: "Book return confirmed",
      data: null,
      error: null
    });
  } catch (error) {
    if (error.message === "Borrow record not found") return next(new ErrorHandler(error.message, 404));
    return next(new ErrorHandler(error.message, 400));
  }
});

// ===== 8. REPORT ISSUE (Lost/Damaged) =====
export const reportIssue = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { issueType, remarks } = req.body; // issueType: "Lost" or "Damaged"
  const adminId = req.user.id;
  const normalizedRemarks = String(remarks || "").trim() || `Book marked as ${issueType}`;

  // Validation
  if (!["Lost", "Damaged"].includes(issueType)) {
    return next(new ErrorHandler("Issue type must be 'Lost' or 'Damaged'", 400));
  }

  let finalBorrowData;

  try {
    // ATOMIC TRANSACTION: Update borrow + book 
    await db.runTransaction(async (transaction) => {
      const borrowRef = db.collection("borrow").doc(id);
      const borrowDoc = await transaction.get(borrowRef);

      if (!borrowDoc.exists) {
        throw new Error("Borrow record not found");
      }

      finalBorrowData = borrowDoc.data();
      const currentStatus = finalBorrowData.status;

      // Ensure the status allows reporting issues
      if (
        currentStatus !== "Borrowed" &&
        currentStatus !== "Overdue" &&
        currentStatus !== "Returned"
      ) {
        throw new Error("Cannot report issue for a request with this status");
      }

      
      let issueStatus = issueType === "Lost" ? "Lost" : "Damaged";

      const bookRef = db.collection("books").doc(finalBorrowData.book_id);
      const bookDoc = await transaction.get(bookRef);
      const currentCopies = bookDoc.exists ? Number(bookDoc.data().availableCopies || 0) : 0;
      const totalCopies = bookDoc.exists ? Number(bookDoc.data().totalCopies || 0) : 0;

      if (totalCopies <= 0) {
        throw new Error("Cannot report issue: total copies already at 0");
      }

      
      const shouldReduceAvailable = currentStatus === "Returned";
      const nextAvailableCopies = shouldReduceAvailable
        ? Math.max(0, currentCopies - 1)
        : currentCopies;
      const nextTotalCopies = Math.max(0, totalCopies - 1);

      // Update borrowRecord
      transaction.update(borrowRef, {
        status: issueType === "Lost" ? "Lost" : "Damaged",
        remarks: normalizedRemarks,
        reportedAt: new Date(),
        updatedAt: new Date()
      });

      // Update book: decrement totalCopies 
      transaction.update(bookRef, {
        totalCopies: nextTotalCopies,
        availableCopies: nextAvailableCopies,
        status: nextAvailableCopies > 0 ? "Available" : "Borrowed",
        updatedAt: new Date()
      });
    });

    // AFTER transaction commits
    await createAuditLog({
      action: `BORROW_${issueType.toUpperCase()}`,
      userId: adminId,
      targetId: id,
      targetType: "BORROW",
      details: { bookId: finalBorrowData.book_id, remarks: normalizedRemarks }
    });

    // Notify user of issue report confirmation
    await createInAppNotification({
      userId: finalBorrowData.user_id,
      type: "ISSUE_REPORTED",
      title: `Report Submitted: ${issueType}`,
      message: `Your report for "${finalBorrowData.bookTitle}" (${issueType}) has been recorded. Staff will review shortly.`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/my-borrowings",
      severity: "warning"
    });

    // Notify admin of new issue report (ADMIN NOTIFICATION SYSTEM)
    await createInAppNotification({
      userId: adminId,
      type: "ADMIN_ALERT_ISSUE_REPORTED",
      title: `Book ${issueType}: ${finalBorrowData.bookTitle}`,
      message: `"${finalBorrowData.userName}" reported "${finalBorrowData.bookTitle}" as ${issueType}. Remarks: ${normalizedRemarks}`,
      borrowId: id,
      bookId: finalBorrowData.book_id,
      actionUrl: "/borrow/all",
      action: "ISSUE_REPORTED",
      severity: "alert"
    });

    res.status(200).json({
      success: true,
      message: `Issue reported as ${issueType}`,
      error: null
    });
  } catch (error) {
    if (error.message === "Borrow record not found") return next(new ErrorHandler(error.message, 404));
    return next(new ErrorHandler(error.message, 400));
  }
});

// ===== 9. GET BORROW STATS (Admin Dashboard) =====
export const getBorrowStats = catchAsyncErrors(async (req, res, next) => {
  try {
    const [
      pendingSnap,
      borrowedSnap,
      overdueSnap,
      returnedSnap,
      totalBooksSnap,
      totalUsersSnap
    ] = await Promise.all([
      db.collection("borrow").where("status", "==", "Pending").count().get(),
      db.collection("borrow").where("status", "==", "Borrowed").count().get(),
      db.collection("borrow").where("status", "==", "Overdue").count().get(),
      db.collection("borrow").where("status", "==", "Returned").count().get(),
      db.collection("books").count().get(),
      db.collection("users").count().get()
    ]);

    const totalPending = pendingSnap.data().count;
    const totalBorrowed = borrowedSnap.data().count;
    const totalOverdue = overdueSnap.data().count;
    const totalReturned = returnedSnap.data().count;

    res.status(200).json({
      success: true,
      message: "Stats fetched",
      data: {
        totalPending,
        totalBorrowed,
        totalOverdue,
        totalReturned,
        totalBooks: totalBooksSnap.data().count,
        totalUsers: totalUsersSnap.data().count,
        totalRecords: totalPending + totalBorrowed + totalOverdue + totalReturned
      },
      error: null
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export default {
  requestBorrow,
  getMyBorrowings,
  cancelBorrow,
  getAllBorrowings,
  approveBorrow,
  rejectBorrow,
  confirmReturn,
  reportIssue,
  getBorrowStats
};








