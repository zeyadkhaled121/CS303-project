import express from "express";
import { 
    register, 
    verifyEmail, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword ,
    updatePassword,
    getUserProfile
} from "../controllers/authController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js"; 

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset", resetPassword);
router.put("/password/update", isAuthenticatedUser, updatePassword);
router.get("/logout", isAuthenticatedUser, logoutUser);
router.get("/me", isAuthenticatedUser, getUserProfile);
export default router;
