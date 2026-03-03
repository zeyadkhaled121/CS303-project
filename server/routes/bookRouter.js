import express from "express";
import { createBook, updateBook, deleteBook } from "../controllers/bookController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticatedUser, authorizeRoles("Admin"), createBook);
router.put("/update/:id", isAuthenticatedUser, authorizeRoles("Admin"), updateBook);
router.delete("/delete/:id", isAuthenticatedUser, authorizeRoles("Admin"), deleteBook);


export default router;
