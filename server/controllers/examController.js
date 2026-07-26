const Exam = require("../models/Exam");

// @desc Get all scheduled exams
// @route GET /api/exams
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new exam schedule entry (Admin only)
// @route POST /api/exams
const createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete an exam schedule entry (Admin only)
// @route DELETE /api/exams/:id
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExams, createExam, deleteExam };
