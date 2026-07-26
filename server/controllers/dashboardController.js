const User = require("../models/User");
const Exam = require("../models/Exam");
const Notice = require("../models/Notice");
const Fee = require("../models/Fee");
const StaffAttendance = require("../models/StaffAttendance");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// @desc Get summary stats for the Command Dashboard
// @route GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalStaff = await User.countDocuments({ role: "teacher" });
    const totalExams = await Exam.countDocuments();
    const totalNotices = await Notice.countDocuments();

    const now = new Date();
    const todayStr = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
      now.getDate()
    ).padStart(2, "0")}/${now.getFullYear()}`;

    // Faculty Today = % of staff marked present today (0% until attendance is marked)
    const presentToday = await StaffAttendance.countDocuments({
      date: todayStr,
      status: "present",
    });
    const facultyAttendancePercent =
      totalStaff > 0 ? Math.round((presentToday / totalStaff) * 100) : 0;

    // Month Revenue / Fee Arrears for the current month & year
    const monthName = MONTHS[now.getMonth()];
    const year = String(now.getFullYear());
    const monthFees = await Fee.find({ month: monthName, year });
    const monthRevenue = monthFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const feeArrears = monthFees.reduce(
      (sum, f) => sum + (f.totalAmount - f.paidAmount),
      0
    );

    // All-time totals (used elsewhere, e.g. Finance Control)
    const allFees = await Fee.find();
    const totalCollection = allFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = allFees.reduce(
      (sum, f) => sum + (f.totalAmount - f.paidAmount),
      0
    );

    res.json({
      totalStudents,
      totalStaff,
      totalExams,
      totalNotices,
      facultyAttendancePercent,
      monthRevenue,
      feeArrears,
      totalCollection,
      totalPending,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
