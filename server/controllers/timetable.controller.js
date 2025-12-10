// controllers/timetable.controller.js
import "../models/connection.js";
import Timetable from "../models/Timetable.js";
import { generateAllTimetables } from "../services/global-scheduler.service.js";

// POST /api/timetable/generate-all
export const generateAll = async (req, res, next) => {
  try {
    const { days, periodsPerDay } = req.body || {};
    const timetables = await generateAllTimetables({ days, periodsPerDay });
    res.status(201).json({ success: true, timetables, message: "Timetables generated successfully" });
  } catch (err) {
    try {
      const parsed = JSON.parse(err.message);
      res.status(400).json(parsed);
    } catch {
      next(err);
    }
  }
};

// GET /api/timetable/class/:classId
export const getTimetableForClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const tt = await Timetable.findOne({ type: "class", referenceId: classId })
      .populate("periods.subject")
      .populate("periods.faculty");
    if (!tt) return res.status(404).json({ message: "No timetable found" });
    res.json(tt);
  } catch (err) {
    next(err);
  }
};

// GET /api/timetable/faculty/:facultyId
export const getTimetableForFaculty = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    const tt = await Timetable.findOne({ type: "faculty", referenceId: facultyId })
      .populate("periods.subject")
      .populate("periods.faculty");
    if (!tt) return res.status(404).json({ message: "No faculty timetable found" });
    res.json(tt);
  } catch (err) {
    next(err);
  }
};

// GET /api/timetable/all
export const getAllTimetables = async (req, res, next) => {
  try {
    const timetables = await Timetable.find({})
      .populate("classRoom")
      .populate("periods.subject")
      .populate("periods.faculty");
    res.json(timetables);
  } catch (err) {
    next(err);
  }
};
