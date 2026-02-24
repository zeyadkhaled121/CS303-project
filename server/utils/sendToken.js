import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res, message) => {
    const secretKey = process.env.JWT_SECRET || "fallback_secret_key_12345";
    const cookieExpire = Number(process.env.COOKIE_EXPIRE) || 7;
    const jwtExpire = process.env.JWT_EXPIRES || "7d";

    const token = jwt.sign({ id: user.id }, secretKey, {
        expiresIn: jwtExpire,
    });

    const options = {
        expires: new Date(
            Date.now() + cookieExpire * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false, 
        sameSite: "Lax",
    };

    const { password, ...userData } = user;

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        user: userData,
        token,
    });
};