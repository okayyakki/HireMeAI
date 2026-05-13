import Application from "../models/Application.js";

export const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const alreadyApplied = await Application.findOne({
      user: req.user._id,
      job: jobId,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const { fullName, email, phone, coverLetter, resumeText, portfolioUrl, linkedInUrl, yearsOfExperience } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone || "",
      coverLetter: coverLetter || "",
      resumeText: resumeText || "",
      portfolioUrl: portfolioUrl || "",
      linkedInUrl: linkedInUrl || "",
      yearsOfExperience: yearsOfExperience || "",
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate("job", "title company location salary type experience remote companyLogo")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["applied", "reviewing", "interviewing", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("job", "title company");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ message: "Status updated successfully", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("user", "name email")
      .populate("job", "title company");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const Job = (await import("../models/Job.js")).default;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants for this job" });
    }
    const applicants = await Application.find({ job: req.params.jobId })
      .populate("user", "name email photo")
      .sort({ createdAt: -1 });

    const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());

    const enriched = applicants.map(app => {
      const resumeText = (app.resumeText || "").toLowerCase();
      const matchedSkills = jobSkills.filter(skill => resumeText.includes(skill.toLowerCase()));
      const atsScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;
      const extractedSkills = [...new Set([...(app.skills || []), ...matchedSkills])].slice(0, 8);

      return {
        ...app.toObject(),
        atsScore: app.atsScore || atsScore,
        skills: extractedSkills,
        matchedSkills,
        totalJobSkills: jobSkills.length,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    const Job = (await import("../models/Job.js")).default;
    const job = await Job.findById(app.job);
    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const text = app.resumeText || `Name: ${app.fullName}\nEmail: ${app.email}\nPhone: ${app.phone}\nExperience: ${app.yearsOfExperience}\nLinkedIn: ${app.linkedInUrl || "N/A"}\nPortfolio: ${app.portfolioUrl || "N/A"}`;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${app.fullName.replace(/\s+/g, "_")}_Resume.txt"`);
    res.send(text);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecruiterStats = async (req, res) => {
  try {
    const Job = (await import("../models/Job.js")).default;
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(j => j._id);
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.title).length;

    const applications = await Application.find({ job: { $in: jobIds } });
    const totalApplicants = applications.length;
    const reviewed = applications.filter(a => a.status !== "applied").length;
    const interviewsScheduled = applications.filter(a => a.status === "interviewing").length;

    res.json({ totalJobs, activeJobs, totalApplicants, interviewsScheduled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
