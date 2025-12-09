// models/Faculty.js
import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: { type: String },
  // workload fields can be used by scheduler if needed
  maxLoadPerDay: { type: Number, default: 6 },
  maxLoadPerWeek: { type: Number, default: 30 }
});

export default mongoose.model("Faculty", FacultySchema);
