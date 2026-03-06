import express from "express";
import {
    register,
    verifyEmail,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    updatePassword,
    getUserProfile,
    getAllUsers,
    promoteToAdmin,
    demoteToUser,
    deleteUser,
} from "../controllers/authController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// ── Public routes ──
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset", resetPassword);

//  Authenticated (any role) 
router.put("/password/update", isAuthenticatedUser, updatePassword);
router.get("/logout", isAuthenticatedUser, logoutUser);
router.get("/me", isAuthenticatedUser, getUserProfile);

// Admin , Super Admin >> view users 
router.get(
    "/admin/users",
    isAuthenticatedUser,
    authorizeRoles("Admin", "Super Admin"),
    getAllUsers
);

// Super Admin only >> staff & user management 
router.put(
    "/admin/user/promote/:userId",
    isAuthenticatedUser,
    authorizeRoles("Super Admin"),
    promoteToAdmin
);
router.put(
    "/admin/user/demote/:userId",
    isAuthenticatedUser,
    authorizeRoles("Super Admin"),
    demoteToUser
);
router.delete(
    "/admin/user/delete/:userId",
    isAuthenticatedUser,
    authorizeRoles("Super Admin"),
    deleteUser
);

export default router;
