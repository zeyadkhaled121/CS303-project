import express from "express";
import { getAllBooks, createBook, updateBook, deleteBook } from "../controllers/bookController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Any authenticated user can view books
router.get("/getall", isAuthenticatedUser, getAllBooks);

//  Admin and Super Admin can manage books
router.post("/add", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), createBook);
router.put("/update/:id", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), updateBook);
router.delete("/delete/:id", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), deleteBook);

export default router;
