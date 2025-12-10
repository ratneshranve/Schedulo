// server/models/Faculty.js
import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  subjects: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      year: { type: Number },
      section: { type: String }
    }
  ],
  weeklyLoadLimit: { type: Number, default: 20, min: 1 },
  maxPeriodsPerDay: { type: Number, default: 6, min: 1 },
  availability: {
    Mon: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Tue: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Wed: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Thu: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Fri: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Faculty", FacultySchema);

