import express from "express";
import { getMe, loginUser, registerUser, verifyUser } from "../controller/User.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/me", isLoggedIn, getMe);


export default router;
