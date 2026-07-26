const User = require("../models/User");
const Fee = require("../models/Fee");

// @desc Get fee ledger for a class/section/month/year (creates default rows if missing)
// @route GET /api/fees?class=&section=&month=&year=
const getFeeLedger = async (req, res) => {
  try {
    const { class: cls, section, month, year } = req.query;

    const filter = { role: "student" };
    if (cls && cls !== "All Classes") filter.class = cls;
    if (section && section !== "All Sections") filter.section = section;

    const students = await User.find(filter).select("name rollNo class section");

    const ledger = await Promise.all(
      students.map(async (s) => {
        // Atomic upsert avoids a race condition where two parallel requests
        // (e.g. React StrictMode double-mount) both try to create the same
        // record and hit the unique index, causing a 500 error.
        const record = await Fee.findOneAndUpdate(
          { student: s._id, month, year },
          {
            $setOnInsert: {
              student: s._id,
              class: s.class,
              section: s.section,
              month,
              year,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return {
          _id: record._id,
          studentId: s._id,
          name: s.name,
          rollNo: s.rollNo,
          totalAmount: record.totalAmount,
          paidAmount: record.paidAmount,
          balanceDue: record.totalAmount - record.paidAmount,
          settlementStatus: record.settlementStatus,
        };
      })
    );

    const actualRevenue = ledger.reduce((sum, l) => sum + l.paidAmount, 0);
    res.json({ actualRevenue, ledger });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a fee record (payment update)
// @route PUT /api/fees/:id
const updateFeeRecord = async (req, res) => {
  try {
    const { totalAmount, paidAmount, settlementStatus } = req.body;
    const record = await Fee.findByIdAndUpdate(
      req.params.id,
      { totalAmount, paidAmount, settlementStatus },
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: "Fee record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get complete fee history for one student (all months/years)
// @route GET /api/fees/student/:id
const getStudentFeeHistory = async (req, res) => {
  try {
    const records = await Fee.find({ student: req.params.id }).sort({
      createdAt: -1,
    });
    const totalPaid = records.reduce((sum, r) => sum + r.paidAmount, 0);
    const totalDue = records.reduce((sum, r) => sum + (r.totalAmount - r.paidAmount), 0);
    res.json({ records, totalPaid, totalDue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFeeLedger, updateFeeRecord, getStudentFeeHistory };

