import express from "express";
import { analyzeResume, getSkillGap, generateQuestions, upload } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", protect, upload.single("resume"), analyzeResume);
router.post("/skill-gap", protect, getSkillGap);
router.post("/generate-questions", protect, generateQuestions);

export default router;