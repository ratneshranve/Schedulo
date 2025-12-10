// server/models/Class.js
import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  section: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  periodsPerDay: { type: Number, default: 8 },
  days: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  createdAt: { type: Date, default: Date.now }
});

// Compound unique index
ClassSchema.index({ department: 1, year: 1, section: 1 }, { unique: true });

export default mongoose.model("Class", ClassSchema);
