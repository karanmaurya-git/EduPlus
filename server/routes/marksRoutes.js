const express = require("express");
const router = express.Router();
const { getMarksLedger, saveMarks, getStudentMarksReport } = require("../controllers/marksController");
const { protect, authorize } = require("../middleware/auth");

router.get("/student/:id", protect, getStudentMarksReport);

router.use(protect, authorize("admin", "teacher"));

router.get("/", getMarksLedger);
router.post("/save", saveMarks);

module.exports = router;
