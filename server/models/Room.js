// models/Room.js
import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["classroom", "lab"], default: "classroom" },
  capacity: { type: Number, default: 30, min: 1 },
  availability: {
    Mon: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Tue: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Wed: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Thu: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] },
    Fri: { type: [Number], default: [1, 2, 3, 4, 5, 6, 7, 8] }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Room", RoomSchema);

