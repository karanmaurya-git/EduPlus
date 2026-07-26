const express = require("express");
const router = express.Router();
const { getExams, createExam, deleteExam } = require("../controllers/examController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getExams);
router.post("/", authorize("admin"), createExam);
router.delete("/:id", authorize("admin"), deleteExam);

module.exports = router;
