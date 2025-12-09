import express from "express";
import { generateForClass, getTimetableForClass } from "../controllers/timetable.controller.js";

const router = express.Router();

router.post("/generate/:classId", generateForClass);
router.get("/class/:classId", getTimetableForClass);

export default router;
