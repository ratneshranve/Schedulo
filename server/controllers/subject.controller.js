import "../models/connection.js";
import Subject from "../models/Subject.js";

export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate("faculty")
      .populate("department");
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

export const getSubjectsByClass = async (req, res, next) => {
  try {
    const { department, year, section } = req.params;
    const subjects = await Subject.find({ department, year, section })
      .populate("faculty");
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    await subject.populate("faculty").populate("department");
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("faculty");
    res.json(subject);
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Subject deleted" });
  } catch (err) {
    next(err);
  }
};
