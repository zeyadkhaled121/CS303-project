import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { db } from "../database/db.js";
import { generateVerificationCode } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js"; 

// 1. Register User
export const register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new ErrorHandler("Please enter all Fields.", 400));
    }

    if (password.length < 8 || password.length > 16) {
        return next(new ErrorHandler("Password must be between 8 and 16 Characters.", 400));
    }

    const verifiedUserQuery = await db.collection("users")
        .where("email", "==", email)
        .where("accountVerified", "==", true)
        .get();

    if (!verifiedUserQuery.empty) {
        return next(new ErrorHandler("User already exists and is verified. Please Login.", 400));
    }

    const unverifiedUserQuery = await db.collection("users")
        .where("email", "==", email)
        .where("accountVerified", "==", false)
        .get();

    if (unverifiedUserQuery.size >= 5) {
        return next(new ErrorHandler("You have exceeded the number of registration attempts. Contact support.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpire = new Date(Date.now() + 15 * 60 * 1000); 

    const userData = {
        name,
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpire,
        accountVerified: false,
        updatedAt: new Date(),
    };

    if (!unverifiedUserQuery.empty) {
        const docId = unverifiedUserQuery.docs[0].id;
        await db.collection("users").doc(docId).update(userData);
    } else {
        await db.collection("users").add({
            ...userData,
            role: "User",
            borrowedBooks: [],
            createdAt: new Date(),
        });
    }

    try {
        await sendVerificationCode(verificationCode, email, res);
    } catch (error) {
        return next(new ErrorHandler("Registration saved, but failed to send verification email.", 500));
    }
});

// 2. Verify Email
export const verifyEmail = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorHandler("Please enter OTP and Email", 400));
    }

    const userSnapshot = await db.collection("users")
        .where("email", "==", email)
        .where("accountVerified", "==", false)
        .get();

    if (userSnapshot.empty) {
        return next(new ErrorHandler("User not found or already verified", 404));
    }

    const userData = userSnapshot.docs[0].data();
    const docId = userSnapshot.docs[0].id;

    if (String(userData.verificationCode) !== String(otp) || userData.verificationCodeExpire.toDate() < new Date()) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    await db.collection("users").doc(docId).update({
        accountVerified: true,
        verificationCode: null,
        verificationCodeExpire: null
    });

    res.status(200).json({
        success: true,
        message: "Email verified successfully!"
    });
});

// 3. Login User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter Email and Password", 400));
    }

    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    if (!user.accountVerified) {
        return next(new ErrorHandler("Please verify your email first.", 401));
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken({ id: userId, ...user }, 200, res, "Logged in successfully.");
});

// 4. Logout User
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
});

// 5. Get User Profile (Current User)
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = req.user; 

    res.status(200).json({
        success: true,
        user,
    });
});

// 6. Forgot Password 
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
        return next(new ErrorHandler("User not found with this email.", 404));
    }

    const docId = userSnapshot.docs[0].id;
    const resetToken = generateVerificationCode(); 
    const resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000); 

    await db.collection("users").doc(docId).update({
        resetPasswordToken: resetToken.toString(),
        resetPasswordExpire: resetTokenExpire,
    });

    try {
        await sendVerificationCode(resetToken, email, res);
    } catch (error) {
        await db.collection("users").doc(docId).update({
            resetPasswordToken: null,
            resetPasswordExpire: null,
        });
        return next(new ErrorHandler("Failed to send reset email.", 500));
    }
});

// 7. Reset Password 
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
        return next(new ErrorHandler("Invalid User", 400));
    }

    const user = userSnapshot.docs[0].data();
    const docId = userSnapshot.docs[0].id;

    if (user.resetPasswordToken !== otp.toString() || user.resetPasswordExpire.toDate() < new Date()) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").doc(docId).update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
    });

    res.status(200).json({
        success: true,
        message: "Password Reset Successfully. Please Login.",
    });
});

// 8. Update Password 
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }

    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("New passwords do not match", 400));
    }

    const userDoc = await db.collection("users").doc(req.user.id).get();
    const user = userDoc.data();

    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").doc(req.user.id).update({
        password: hashedPassword,
    });

    sendToken({ id: req.user.id, ...user }, 200, res, "Password Updated Successfully");
});
