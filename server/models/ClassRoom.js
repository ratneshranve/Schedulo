// models/ClassRoom.js
import mongoose from "mongoose";

const ClassRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., CSE-3A
  semester: { type: Number },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  periodsPerDay: { type: Number, default: 8 }, // ensure 8
  days: { type: [String], default: ["Mon","Tue","Wed","Thu","Fri"] }
});

export default mongoose.model("ClassRoom", ClassRoomSchema);
