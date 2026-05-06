import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["recruiter", "jobseeker"],
    default: "jobseeker",
  },
  photo: {
    type: String,
  },
  provider: {
    type: String,
    enum: ["email", "google", "github"],
    default: "email",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;