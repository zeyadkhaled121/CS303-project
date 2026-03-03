import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import bookRouter from "./routes/bookRouter.js";
import fileUpload from "express-fileupload";

export const app = express();

config({ path: "./config/config.env" });

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, 
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/user", authRouter);
app.use("/api/v1/book", bookRouter);

app.use(errorMiddleware);
