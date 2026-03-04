import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";
import jwt from "jsonwebtoken";
import { db } from "../database/db.js";

// 1. (Authentication)
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource.", 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    req.user = { id: userDoc.id, ...userDoc.data() };
    next();
});

// 2. (Authorization)
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user.role (isAuthenticatedUser)
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
