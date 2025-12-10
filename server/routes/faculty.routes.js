// routes/faculty.routes.js
import express from "express";
import {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
} from "../controllers/faculty.controller.js";

const router = express.Router();

router.get("/", getAllFaculty);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

export default router;
