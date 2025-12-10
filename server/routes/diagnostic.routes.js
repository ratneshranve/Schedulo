import express from "express";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import Faculty from "../models/Faculty.js";

const router = express.Router();

router.get("/data-summary", async (req, res, next) => {
  try {
    const classes = await Class.find().populate("department").populate("subjects");
    const subjects = await Subject.find().populate("faculty");
    const faculties = await Faculty.find();

    const summary = {
      classCount: classes.length,
      subjectCount: subjects.length,
      facultyCount: faculties.length,
      classes: classes.map(c => ({
        id: c._id,
        dept: c.department?.name,
        year: c.year,
        section: c.section,
        subjectCount: c.subjects?.length || 0,
        subjects: c.subjects?.map(s => ({
          id: s._id,
          name: s.name,
          code: s.code,
          type: s.type,
          sessionsPerWeek: s.sessionsPerWeek,
          facultyAssigned: s.faculty?.length || 0,
          faculty: s.faculty?.map(f => ({ id: f._id, name: f.name }))
        }))
      })),
      faculties: faculties.map(f => ({
        id: f._id,
        name: f.name,
        weeklyLoadLimit: f.weeklyLoadLimit,
        maxPeriodsPerDay: f.maxPeriodsPerDay,
        availability: f.availability,
        subjectCount: f.subjects?.length || 0
      }))
    };

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
