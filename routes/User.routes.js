import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { loginUser, registerUser, verifyUser, getMe, logoutUser } from "../controller/User.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.get("/profile", protect, getMe);
router.get("/logout", protect, logoutUser);

export default router;
