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
    // Convert to plain objects and serialize to ensure no Mongoose objects are included
    const plainTimetables = timetables.map(tt => {
      const obj = tt.toObject ? tt.toObject() : tt;
      // ensure subject/faculty metadata are plain
      if (obj.periods && Array.isArray(obj.periods)) {
        obj.periods = obj.periods.map(p => ({
          ...p,
          subject: p.subject && p.subject.name ? { _id: p.subject._id, name: p.subject.name, code: p.subject.code } : p.subject,
          faculty: p.faculty && p.faculty.name ? { _id: p.faculty._id, name: p.faculty.name } : p.faculty
        }));
      }
      return JSON.parse(JSON.stringify(obj));
    });
    res.status(201).json({ success: true, timetables: plainTimetables, message: "Timetables generated successfully" });
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
    const plain = tt.toObject ? tt.toObject() : tt;
    res.json(JSON.parse(JSON.stringify(plain)));
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
    const plain = tt.toObject ? tt.toObject() : tt;
    res.json(JSON.parse(JSON.stringify(plain)));
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
    const plainTimetables = timetables.map(tt => tt.toObject ? tt.toObject() : tt);
    res.json(plainTimetables.map(t => JSON.parse(JSON.stringify(t))));
  } catch (err) {
    next(err);
  }
};
