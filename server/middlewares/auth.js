import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";
import jwt from "jsonwebtoken";
import { db } from "../database/db.js";


// 1. Authentication 
// ──────────────────────────────────────────────
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    //  Mobile path
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    // Web path
    if (!token && req.cookies) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource.", 401));
    }

    let decoded;
    try {
        const secretKey = process.env.JWT_SECRET || "fallback_secret_key_12345";
        decoded = jwt.verify(token, secretKey);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new ErrorHandler("Your session has expired. Please login again.", 401));
        }
        return next(new ErrorHandler("Your authentication token is invalid. Please login again.", 401));
    }

    const userDoc = await db.collection("users").doc(decoded.id).get();

    if (!userDoc.exists) {
        return next(new ErrorHandler("User no longer exists. Please register again.", 404));
    }

    const userData = userDoc.data();

    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
    if (
        SUPER_ADMIN_EMAIL &&
        userData.email === SUPER_ADMIN_EMAIL &&
        userData.role !== "Super Admin"
    ) {
        await db.collection("users").doc(userDoc.id).update({ role: "Super Admin" });
        userData.role = "Super Admin";
    }

    req.user = { id: userDoc.id, ...userData };
    next();
});

// 2. Authorization  

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Access denied. Your role (${req.user.role}) does not have permission to access this resource.`,
                    403
                )
            );
        }
        next();
    };
};
