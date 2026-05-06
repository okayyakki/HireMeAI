import express from "express";
import { registerUser, loginUser, socialLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/social-login", socialLogin);

export default router;