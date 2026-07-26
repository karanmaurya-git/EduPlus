const User = require("../models/User");
const SessionalMark = require("../models/SessionalMark");

// @desc Load marks entry ledger for class/section/assessmentType/subject
// @route GET /api/marks?class=&section=&assessmentType=&subject=
const getMarksLedger = async (req, res) => {
  try {
    const { class: cls, section, assessmentType, subject, year } = req.query;
    if (!cls || !section || !assessmentType || !subject) {
      return res.status(400).json({ message: "class, section, assessmentType, subject required" });
    }

    const students = await User.find({ role: "student", class: cls, section }).select(
      "name rollNo"
    );

    const yr = year || new Date().getFullYear().toString();

    const ledger = await Promise.all(
      students.map(async (s) => {
        // Atomic upsert avoids a race condition where two parallel requests
        // both try to create the same record and hit the unique index.
        const record = await SessionalMark.findOneAndUpdate(
          { student: s._id, assessmentType, subject, year: yr },
          {
            $setOnInsert: {
              student: s._id,
              class: cls,
              section,
              assessmentType,
              subject,
              year: yr,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return {
          _id: record._id,
          studentId: s._id,
          name: s.name,
          rollNo: s.rollNo,
          marksObtained: record.marksObtained,
          maxMarks: record.maxMarks,
          remarks: record.remarks,
          status: record.marksObtained >= record.maxMarks * 0.33 ? "PASS" : "FAIL",
        };
      })
    );

    res.json({ subject, totalStudents: students.length, ledger });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Finalize/save marks (bulk upsert)
// @route POST /api/marks/save
const saveMarks = async (req, res) => {
  try {
    const { entries } = req.body; // [{ _id, marksObtained, maxMarks, remarks }]
    if (!Array.isArray(entries)) {
      return res.status(400).json({ message: "entries[] required" });
    }

    const ops = entries.map((e) => ({
      updateOne: {
        filter: { _id: e._id },
        update: {
          $set: {
            marksObtained: e.marksObtained,
            maxMarks: e.maxMarks,
            remarks: e.remarks,
          },
        },
      },
    }));

    await SessionalMark.bulkWrite(ops);
    res.json({ message: "Marks finalized and saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all sessional marks for one student (Academic Results report)
// @route GET /api/marks/student/:id
const getStudentMarksReport = async (req, res) => {
  try {
    const records = await SessionalMark.find({ student: req.params.id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMarksLedger, saveMarks, getStudentMarksReport };

