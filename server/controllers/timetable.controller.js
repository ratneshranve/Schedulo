// controllers/timetable.controller.js
import { generateTimetable } from "../services/scheduler.service.js";
import Timetable from "../models/Timetable.js";

export const generateForClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const tt = await generateTimetable(classId, { days: ["Mon","Tue","Wed","Thu","Fri"], periodsPerDay: 6 });
    res.status(201).json(tt);
  } catch (err) { next(err); }
};

export const getTimetableForClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const tt = await Timetable.findOne({ classRoom: classId }).populate("periods.subject").populate("periods.faculty");
    res.json(tt);
  } catch (err) { next(err); }
};
