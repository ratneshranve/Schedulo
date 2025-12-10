// controllers/faculty.controller.js
import "../models/connection.js";
import Faculty from "../models/Faculty.js";

export const getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.find().populate("department").populate("subjects.subject");
    res.json(faculty);
  } catch (err) {
    next(err);
  }
};

export const createFaculty = async (req, res, next) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    await faculty.populate("department").populate("subjects.subject");
    res.status(201).json(faculty);
  } catch (err) {
    next(err);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("department")
      .populate("subjects.subject");
    res.json(faculty);
  } catch (err) {
    next(err);
  }
};

export const deleteFaculty = async (req, res, next) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(id, { availability }, { new: true });
    res.json(faculty);
  } catch (err) {
    next(err);
  }
};
