import jwt from "jsonwebtoken";


export const sendToken = (user, statusCode, res, message) => {
    const secretKey = process.env.JWT_SECRET || "fallback_secret_key_12345";
    const jwtExpire = process.env.JWT_EXPIRES || "7d";

    const token = jwt.sign({ id: user.id }, secretKey, {
        expiresIn: jwtExpire,
    });

    const { password, verificationCode, verificationCodeExpire, resetPasswordToken, resetPasswordExpire, ...userData } = user;

    res.status(statusCode).json({
        success: true,
        message,
        data: {
            user: userData,
            token,
        },
        error: null,
    });
};