import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { db } from "../database/db.js"; 
import { generateVerificationCode } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";

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
