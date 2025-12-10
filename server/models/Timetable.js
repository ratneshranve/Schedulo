// models/Timetable.js
import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  day: { type: String, required: true },
  periodIndex: { type: Number, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  isLab: { type: Boolean, default: false },
  startTime: { type: String },
  endTime: { type: String }
});

const TimetableSchema = new mongoose.Schema({
  type: { type: String, enum: ["class", "faculty"], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  referenceName: { type: String },
  periods: [PeriodSchema],
  generatedAt: { type: Date, default: Date.now },
  config: { type: mongoose.Schema.Types.ObjectId, ref: "Config" }
});

export default mongoose.model("Timetable", TimetableSchema);

