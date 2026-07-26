const User = require("../models/User");
const StaffAttendance = require("../models/StaffAttendance");

// @desc Load staff registry for a given date (with current status)
// @route GET /api/staff-attendance?date=
const getStaffRegistry = async (req, res) => {
  try {
    const { date } = req.query;
    const staffList = await User.find({ role: "teacher" }).select("-password");

    const records = await StaffAttendance.find({ date });
    const recordMap = {};
    records.forEach((r) => (recordMap[r.staff.toString()] = r.status));

    const registry = staffList.map((s) => ({
      _id: s._id,
      name: s.name,
      teacherId: s.teacherId,
      primarySubject: s.primarySubject,
      status: recordMap[s._id.toString()] || "present",
    }));

    res.json({ totalActive: staffList.length, registry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Save staff attendance ledger for a date (bulk upsert)
// @route POST /api/staff-attendance/save
const saveStaffAttendance = async (req, res) => {
  try {
    const { date, entries } = req.body; // entries: [{ staffId, status }]
    if (!date || !Array.isArray(entries)) {
      return res.status(400).json({ message: "date and entries[] required" });
    }

    const ops = entries.map((e) => ({
      updateOne: {
        filter: { staff: e.staffId, date },
        update: { $set: { status: e.status, markedBy: req.user._id } },
        upsert: true,
      },
    }));

    await StaffAttendance.bulkWrite(ops);
    res.json({ message: "Attendance ledger saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStaffRegistry, saveStaffAttendance };
