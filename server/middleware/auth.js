import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";
import { db } from "../database/db.js";

export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const userDoc = await db.collection("users").doc(decodedData.id).get();

    if (!userDoc.exists) {
        return next(new ErrorHandler("User no longer exists", 404));
    }

    req.user = { id: userDoc.id, ...userDoc.data() };
    next();
});