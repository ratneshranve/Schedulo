// controllers/timetable.controller.js
import "../models/connection.js";
import Timetable from "../models/Timetable.js";
import { generateAllTimetables } from "../services/global-scheduler.service.js";

// POST /api/timetable/generate-all
export const generateAll = async (req, res, next) => {
  try {
    console.log("[TimetableController] Generate request received");
    const { days, periodsPerDay } = req.body || {};
    const timetables = await generateAllTimetables({ days, periodsPerDay });
    console.log("[TimetableController] Timetables generated successfully");
    res.status(201).json({ success: true, timetables, message: "Timetables generated successfully" });
  } catch (err) {
    console.error("[TimetableController] Error during generation:", err.message);
    try {
      const parsed = JSON.parse(err.message);
      res.status(400).json(parsed);
    } catch {
      res.status(500).json({ 
        success: false, 
        error: err.message || "Scheduling failed", 
        diagnostics: { 
          originalError: err.toString(),
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        } 
      });
    }
  }
};

// GET /api/timetable/class/:classId
export const getTimetableForClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    let tt = await Timetable.findOne({ type: "class", referenceId: classId });
    if (!tt) return res.status(404).json({ message: "No timetable found" });
    await tt.populate("periods.subject");
    await tt.populate("periods.faculty");
    res.json(tt);
  } catch (err) {
    next(err);
  }
};

// GET /api/timetable/faculty/:facultyId
export const getTimetableForFaculty = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    let tt = await Timetable.findOne({ type: "faculty", referenceId: facultyId });
    if (!tt) return res.status(404).json({ message: "No faculty timetable found" });
    await tt.populate("periods.subject");
    await tt.populate("periods.faculty");
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
