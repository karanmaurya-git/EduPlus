const Timetable = require("../models/Timetable");

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const PERIODS = [
  "LEC.01",
  "LEC.02",
  "LEC.03",
  "LEC.04",
  "LEC.05",
  "LEC.06",
  "LEC.07",
  "LEC.08",
  "LEC.09",
];

// @desc Load full weekly timetable grid for a class/section
// @route GET /api/timetable?class=&section=
const getTimetable = async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    if (!cls || !section) {
      return res.status(400).json({ message: "class and section are required" });
    }

    const entries = await Timetable.find({ class: cls, section });

    const grid = {};
    DAYS.forEach((day) => {
      grid[day] = {};
      PERIODS.forEach((p) => (grid[day][p] = null));
    });

    entries.forEach((e) => {
      if (grid[e.day]) {
        grid[e.day][e.period] = {
          _id: e._id,
          subjectName: e.subjectName,
          subjectCode: e.subjectCode,
          subjectType: e.subjectType,
          facultyName: e.facultyName,
          facultyCode: e.facultyCode,
          department: e.department,
        };
      }
    });

    res.json({ days: DAYS, periods: PERIODS, grid, entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Assign/update a lecture slot
// @route POST /api/timetable/assign
const assignLecture = async (req, res) => {
  try {
    const {
      class: cls,
      section,
      day,
      period,
      subjectName,
      subjectCode,
      subjectType,
      facultyName,
      facultyCode,
      department,
    } = req.body;

    if (!cls || !section || !day || !period) {
      return res.status(400).json({ message: "class, section, day, period are required" });
    }

    const entry = await Timetable.findOneAndUpdate(
      { class: cls, section, day, period },
      {
        subjectName,
        subjectCode,
        subjectType,
        facultyName,
        facultyCode,
        department,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove a lecture slot
// @route DELETE /api/timetable/:id
const deleteLecture = async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Slot not found" });
    res.json({ message: "Slot cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTimetable, assignLecture, deleteLecture };
