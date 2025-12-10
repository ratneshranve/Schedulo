// server/controllers/department.controller.js
import Department from "../models/Department.js";

export const getAllDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: "Name and code required" });
    const dept = new Department({ name, code });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(dept);
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    next(err);
  }
};
