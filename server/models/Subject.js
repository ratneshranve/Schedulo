// models/Subject.js
import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["lecture", "lab"], default: "lecture" },
  sessionsPerWeek: { type: Number, required: true, min: 1 },
  labContinuousPeriods: { type: Number, default: 2 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  year: { type: Number, required: true },
  section: { type: String, required: true },
  faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }],
  preferredTime: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Subject", SubjectSchema);

