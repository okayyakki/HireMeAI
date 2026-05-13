import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  coverLetter: { type: String, default: "" },
  resumeText: { type: String, default: "" },
  resumeFileUrl: { type: String, default: "" },
  portfolioUrl: { type: String, default: "" },
  linkedInUrl: { type: String, default: "" },
  yearsOfExperience: { type: String, default: "" },
  status: { type: String, default: "applied" },
  atsScore: { type: Number, default: 0 },
  skills: [{ type: String }]
}, { timestamps: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
