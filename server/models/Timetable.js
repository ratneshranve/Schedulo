// models/Timetable.js
import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  day: { type: String, required: true },
  periodIndex: { type: Number, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }
});

const TimetableSchema = new mongoose.Schema({
  classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", required: true },
  periods: [PeriodSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Timetable", TimetableSchema);
