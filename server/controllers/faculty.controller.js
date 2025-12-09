// controllers/faculty.controller.js
import "../models/connection.js"; // loads DB connection
import Faculty from "../models/Faculty.js";

// GET /api/faculty
export const getAllFaculty = async (req, res, next) => {
  try {
    const list = await Faculty.find();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// POST /api/faculty
export const createFaculty = async (req, res, next) => {
  try {
    const f = new Faculty(req.body);
    await f.save();
    res.status(201).json(f);
  } catch (err) {
    next(err);
  }
};

// PUT /api/faculty/:id
export const updateFaculty = async (req, res, next) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/faculty/:id
export const deleteFaculty = async (req, res, next) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
