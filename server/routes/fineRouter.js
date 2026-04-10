import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import {
  confirmFinePayment,
  unbanUser,
  getFines,
  getAllFines,
  getUserOffenses,
  getBannedUsers
} from "../controllers/fineController.js";

const router = express.Router();

router.get("/user/fines", isAuthenticatedUser, getFines);
router.get("/admin/fines", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), getAllFines);
router.patch("/admin/fines/:id/confirm-payment", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), confirmFinePayment);
router.get("/admin/users/:id/offenses", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), getUserOffenses);
router.patch("/admin/users/:id/unban", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), unbanUser);
router.get("/admin/banned-users", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), getBannedUsers);

export default router;
