import express from "express";
import { createJob, getJobs, updateJob, deleteJob, toggleJobStatus } from "../controllers/jobController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", getJobs);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.patch("/:id/toggle-status", protect, toggleJobStatus);
router.get("/my-jobs", protect, async (req, res) => {
  const Job = (await import("../models/Job.js")).default;
  const Application = (await import("../models/Application.js")).default;
  const jobs = await Job.find({ postedBy: req.user._id }).populate("postedBy", "name email").sort({ createdAt: -1 });

  const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
    const applicantsCount = await Application.countDocuments({ job: job._id });
    return {
      ...job.toObject(),
      applicantsCount,
    };
  }));

  res.json(jobsWithCounts);
});

export default router;
