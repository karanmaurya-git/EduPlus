const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    date: { type: String, required: true }, // MM/DD/YYYY
    period: { type: String, default: "Daily (Full Day)" },
    status: {
      type: String,
      enum: ["present", "absent", "late", "holiday"],
      default: "present",
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
