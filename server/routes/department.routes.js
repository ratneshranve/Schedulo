import express from "express";
import * as departmentController from "../controllers/department.controller.js";

const router = express.Router();

router.get("/", departmentController.getAllDepartments);
router.post("/", departmentController.createDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

export default router;
