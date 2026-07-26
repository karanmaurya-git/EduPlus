const mongoose = require("mongoose");

const sessionalMarkSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    assessmentType: { type: String, required: true }, // e.g. "1st Sessional"
    subject: { type: String, required: true },
    marksObtained: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 100 },
    remarks: { type: String, default: "" },
    year: { type: String, default: new Date().getFullYear().toString() },
  },
  { timestamps: true }
);

sessionalMarkSchema.index(
  { student: 1, assessmentType: 1, subject: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("SessionalMark", sessionalMarkSchema);
