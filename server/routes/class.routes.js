import express from "express";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass
} from "../controllers/class.controller.js";

const router = express.Router();

router.get("/", getAllClasses);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
