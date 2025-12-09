// controllers/subject.controller.js
import "../models/connection.js";
import Subject from "../models/Subject.js";

// GET /api/subjects
export const getAllSubjects = async (req, res, next) => {
  try {
    const list = await Subject.find().populate("faculty");
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects
export const createSubject = async (req, res, next) => {
  try {
    const s = new Subject(req.body);
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    next(err);
  }
};

// PUT /api/subjects/:id
export const updateSubject = async (req, res, next) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subjects/:id
export const deleteSubject = async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
