import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res, message) => {
    // JWT secret should be stored securely in env; fallback is only for development
    const secretKey = process.env.JWT_SECRET || "fallback_secret_key_12345";
    const cookieExpire = Number(process.env.COOKIE_EXPIRE) || 7; // days
    const jwtExpire = process.env.JWT_EXPIRES || "7d";

    // create a token that only encodes the user id; sensitive data is kept server-side
    const token = jwt.sign({ id: user.id }, secretKey, {
        expiresIn: jwtExpire,
    });

    // configure cookie attributes; httpOnly prevents JS access (XSS mitigation)
    const options = {
        expires: new Date(
            Date.now() + cookieExpire * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false, // set to true when deploying over HTTPS
        sameSite: "Lax", // CSRF mitigation
    };

    // avoid sending password back in response
    const { password, ...userData } = user;

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        user: userData,
        token,
    });
};