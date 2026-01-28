import express from "express";
import { registerUser, verifyUser } from "../controller/User.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);

export default router;
