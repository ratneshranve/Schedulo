// models/Config.js
import mongoose from "mongoose";

const ConfigSchema = new mongoose.Schema({
  workingDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  periodsPerDay: { type: Number, default: 8, min: 4, max: 12 },
  periodDuration: { type: Number, default: 50, min: 30, max: 120 },
  instituteStartTime: { type: String, default: "08:00" },
  instituteEndTime: { type: String, default: "17:00" },
  breaks: [
    {
      name: { type: String },
      afterPeriod: { type: Number },
      duration: { type: Number },
      startTime: { type: String }
    }
  ],
  labAllowedStarts: { type: [Number], default: [1, 3, 5, 7] },
  maxConsecutivePeriodsForFaculty: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Config", ConfigSchema);

