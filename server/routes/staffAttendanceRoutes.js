const express = require("express");
const router = express.Router();
const {
  getStaffRegistry,
  saveStaffAttendance,
} = require("../controllers/staffAttendanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/", getStaffRegistry);
router.post("/save", saveStaffAttendance);

module.exports = router;
