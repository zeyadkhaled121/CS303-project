import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import bookRouter from "./routes/bookRouter.js";
import borrowRouter from "./routes/borrowRouter.js";
import fineRouter from "./routes/fineRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import fileUpload from "express-fileupload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const app = express();

config({ path: join(__dirname, "config", "config.env") });

/**
 * CORS Configuration
 * ------------------
 *   on the local network can reach the API (e.g. http://192.168.x.x:5000).
 * - For production, replace the origin with your actual frontend URL(s).
 */
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : [];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            if (process.env.NODE_ENV !== "production") return callback(null, true);
            callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: "Malformed JSON payload detected. Request terminated." });
  }
  next(err);
});

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: join(tmpdir(), "library-uploads"),
}));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running.",
        data: null,
        error: null,
    });
});



app.use("/api/v1/user", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api", fineRouter);
app.use("/api/v1/notifications", notificationRouter);

app.all("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
        data: null,
        error: `Cannot ${req.method} ${req.originalUrl}`,
    });
});

app.use(errorMiddleware);
