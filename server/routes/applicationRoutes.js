import express from "express";
import multer from "multer";
import { applyToJob, getUserApplications, updateApplicationStatus, getAllApplications, getJobApplicants, getRecruiterStats, downloadResume } from "../controllers/applicationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const ext = "." + file.originalname.split(".").pop().toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed"));
    }
  }
});

router.post("/:id", protect, upload.single("resume"), applyToJob);
router.get("/my", protect, getUserApplications);
router.put("/:id/status", protect, updateApplicationStatus);
router.get("/all", protect, getAllApplications);
router.get("/job/:jobId/applicants", protect, getJobApplicants);
router.get("/recruiter/stats", protect, getRecruiterStats);
router.get("/:id/download", protect, downloadResume);

export default router;
