import express from "express";
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from "../controllers/subject.controller.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
