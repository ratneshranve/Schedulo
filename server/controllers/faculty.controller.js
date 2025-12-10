// controllers/faculty.controller.js
import "../models/connection.js";
import Faculty from "../models/Faculty.js";

export const getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.find().populate("department");
    res.json(faculty);
  } catch (err) {
    next(err);
  }
};

export const createFaculty = async (req, res, next) => {
  try {
    const data = { ...req.body };
    // Ensure empty strings are removed to avoid E11000 on sparse fields
    if (!data.email || data.email.trim() === "") {
      delete data.email;
    }
    if (!data.department || data.department.trim() === "") {
      delete data.department;
    }
    const faculty = new Faculty(data);
    await faculty.save();
    await faculty.populate("department");
    res.status(201).json(faculty);
  } catch (err) {
    next(err);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const data = { ...req.body };
    // Ensure empty strings are removed to avoid E11000 on sparse fields
    if (!data.email || data.email.trim() === "") {
      delete data.email;
    }
    if (!data.department || data.department.trim() === "") {
      delete data.department;
    }
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate("department");
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
