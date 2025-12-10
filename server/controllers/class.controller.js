import "../models/connection.js";
import Class from "../models/Class.js";

export const getAllClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate("department")
      .populate("subjects");
    console.log(`[ClassController] getAllClasses found ${classes.length} classes`);
    res.json(classes);
  } catch (err) {
    next(err);
  }
};

export const getClassesForDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const classes = await Class.find({ department: departmentId }).populate("subjects");
    res.json(classes);
  } catch (err) {
    next(err);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { department, year, section } = req.body;
    if (!department || !year || !section) {
      return res.status(400).json({ error: "Department, year, and section required" });
    }
    const cls = new Class(req.body);
    await cls.save();
    await cls.populate("department");
    console.log(`[ClassController] Created class: ${cls._id} - Dept: ${cls.department}, Year: ${cls.year}, Section: ${cls.section}, Subjects: ${cls.subjects?.length || 0}`);
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("department")
      .populate("subjects");
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted" });
  } catch (err) {
    next(err);
  }
};

export const addSubjectToClass = async (req, res, next) => {
  try {
    const { classId, subjectId } = req.body;
    const cls = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { subjects: subjectId } },
      { new: true }
    ).populate("subjects");
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

export const removeSubjectFromClass = async (req, res, next) => {
  try {
    const { classId, subjectId } = req.body;
    const cls = await Class.findByIdAndUpdate(
      classId,
      { $pull: { subjects: subjectId } },
      { new: true }
    ).populate("subjects");
    res.json(cls);
  } catch (err) {
    next(err);
  }
};
