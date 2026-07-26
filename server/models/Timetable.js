const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    class: { type: String, required: true },
    section: { type: String, required: true },
    day: { type: String, required: true }, // MONDAY..SATURDAY
    period: { type: String, required: true }, // LEC.01 ... LEC.09
    subjectName: { type: String, default: "" },
    subjectCode: { type: String, default: "" },
    subjectType: { type: String, default: "Theory" },
    facultyName: { type: String, default: "" },
    facultyCode: { type: String, default: "" },
    department: { type: String, default: "" },
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, section: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
