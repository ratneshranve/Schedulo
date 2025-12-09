// models/Subject.js
import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  semester: { type: Number },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  sessionsPerWeek: { type: Number, default: 4 },
  isLab: { type: Boolean, default: false }, // lab sessions often need consecutive periods
  labSizePeriods: { type: Number, default: 2 } // if isLab true, use this many consecutive periods
});

export default mongoose.model("Subject", SubjectSchema);
