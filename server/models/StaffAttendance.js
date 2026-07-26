const mongoose = require("mongoose");

const staffAttendanceSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // MM/DD/YYYY
    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      default: "present",
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StaffAttendance", staffAttendanceSchema);
