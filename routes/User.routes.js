import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { loginUser, registerUser, verifyUser, getMe, logoutUser, forgotPassword, resetPassword } from "../controller/User.controller.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset/:token", resetPassword);

// Protected Routes
router.get("/profile", protect, getMe);
router.get("/logout", protect, logoutUser);

export default router;

