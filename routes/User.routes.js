import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { loginUser, registerUser, verifyUser, getMe } from "../controller/User.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);


export default router;
