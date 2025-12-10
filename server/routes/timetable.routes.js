// routes/timetable.routes.js
import express from "express";
import { generateAll, getTimetableForClass, getTimetableForFaculty, getAllTimetables } from "../controllers/timetable.controller.js";

const router = express.Router();

router.post("/generate-all", generateAll);
router.get("/all", getAllTimetables);
router.get("/class/:classId", getTimetableForClass);
router.get("/faculty/:facultyId", getTimetableForFaculty);

export default router;
