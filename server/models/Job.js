import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: { type: String, default: "🏢" },
  description: { type: String, required: true },
  location: { type: String, default: "Remote" },
  salary: { type: String, default: "Not specified" },
  type: { type: String, default: "Full-time" },
  experience: { type: String, default: "Not specified" },
  remote: { type: Boolean, default: false },
  workplaceType: { type: String, enum: ["remote", "hybrid", "onsite"], default: "remote" },
  benefits: [{ type: String }],
  postedDate: { type: Date, default: Date.now },
  skillsRequired: [{ type: String }],
  requirements: [{ type: String }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  views: { type: Number, default: 0 }
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);
export default Job;
