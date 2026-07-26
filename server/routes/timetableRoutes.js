const express = require("express");
const router = express.Router();
const {
  getTimetable,
  assignLecture,
  deleteLecture,
} = require("../controllers/timetableController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getTimetable);
router.post("/assign", authorize("admin"), assignLecture);
router.delete("/:id", authorize("admin"), deleteLecture);

module.exports = router;
