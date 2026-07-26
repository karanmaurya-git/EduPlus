const express = require("express");
const router = express.Router();
const {
  getRollList,
  saveAttendance,
  getAttendanceSummary,
  getStudentAttendanceReport,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/roll", authorize("admin", "teacher"), getRollList);
router.post("/save", authorize("admin", "teacher"), saveAttendance);
router.get("/summary", getAttendanceSummary);
router.get("/student/:id", getStudentAttendanceReport);

module.exports = router;
