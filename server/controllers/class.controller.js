// controllers/class.controller.js
import "../models/connection.js";
import ClassRoom from "../models/ClassRoom.js";

// GET /api/classes
export const getAllClasses = async (req, res, next) => {
  try {
    const list = await ClassRoom.find().populate({
      path: "subjects",
      populate: { path: "faculty" }
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// POST /api/classes
export const createClass = async (req, res, next) => {
  try {
    const c = new ClassRoom(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
};

// PUT /api/classes/:id
export const updateClass = async (req, res, next) => {
  try {
    const updated = await ClassRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/classes/:id
export const deleteClass = async (req, res, next) => {
  try {
    await ClassRoom.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
