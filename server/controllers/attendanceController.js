const User = require("../models/User");
const Attendance = require("../models/Attendance");

// @desc Load roll list for a class/section on a given date (with current status if marked)
// @route GET /api/attendance/roll?class=&section=&date=&period=
const getRollList = async (req, res) => {
  try {
    const { class: cls, section, date, period } = req.query;
    if (!cls || !section) {
      return res.status(400).json({ message: "class and section are required" });
    }

    const students = await User.find({ role: "student", class: cls, section }).select(
      "-password"
    );

    const records = await Attendance.find({
      class: cls,
      section,
      date,
      period: period || "Daily (Full Day)",
    });

    const recordMap = {};
    records.forEach((r) => (recordMap[r.student.toString()] = r.status));

    const rollList = students.map((s) => ({
      _id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      status: recordMap[s._id.toString()] || "present",
    }));

    res.json({ totalStudents: students.length, rollList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Save/finalize attendance for a class on a date (bulk upsert)
// @route POST /api/attendance/save
const saveAttendance = async (req, res) => {
  try {
    const { class: cls, section, date, period, entries } = req.body;
    // entries: [{ studentId, status }]

    if (!cls || !section || !date || !Array.isArray(entries)) {
      return res.status(400).json({ message: "class, section, date and entries[] are required" });
    }

    const ops = entries.map((e) => ({
      updateOne: {
        filter: {
          student: e.studentId,
          date,
          period: period || "Daily (Full Day)",
        },
        update: {
          $set: {
            class: cls,
            section,
            status: e.status,
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ message: "Attendance saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Attendance sheet/summary for a class/section for a month+year (calendar view)
// @route GET /api/attendance/summary?class=&section=&month=&year=
const getAttendanceSummary = async (req, res) => {
  try {
    const { class: cls, section, month, year } = req.query;
    if (!cls || !section) {
      return res.status(400).json({ message: "class and section are required" });
    }

    const students = await User.find({ role: "student", class: cls, section }).select(
      "name rollNo"
    );

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);

    const records = await Attendance.find({
      class: cls,
      section,
      date: {
        $gte: `${String(monthIndex + 1).padStart(2, "0")}/01/${year}`,
        $lte: `${String(monthIndex + 1).padStart(2, "0")}/${String(end.getDate()).padStart(
          2,
          "0"
        )}/${year}`,
      },
    });

    const sheet = students.map((s) => {
      const dayStatuses = {};
      records
        .filter((r) => r.student.toString() === s._id.toString())
        .forEach((r) => {
          const day = r.date.split("/")[1];
          dayStatuses[day] = r.status;
        });
      return { studentId: s._id, name: s.name, rollNo: s.rollNo, days: dayStatuses };
    });

    res.json({ daysInMonth: end.getDate(), sheet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Detailed attendance report for one student
// @route GET /api/attendance/student/:id
const getStudentAttendanceReport = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.id }).sort({ date: -1 });
    const totalPresent = records.filter((r) => r.status === "present").length;
    const percentage = records.length ? ((totalPresent / records.length) * 100).toFixed(1) : "0.0";
    res.json({ records, totalPresent, totalRecords: records.length, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRollList,
  saveAttendance,
  getAttendanceSummary,
  getStudentAttendanceReport,
};
