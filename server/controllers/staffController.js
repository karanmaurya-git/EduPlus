const User = require("../models/User");

// @desc Get all staff (teachers)
// @route GET /api/staff
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "teacher" }).select("-password").sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add new staff member (Admin only)
// @route POST /api/staff
const addStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const staff = await User.create({
      ...req.body,
      role: "teacher",
      accessProtocol: "TEACHER_SECURE_V1",
    });

    const { password: pw, ...rest } = staff.toObject();
    res.status(201).json(rest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update staff member
// @route PUT /api/staff/:id
const updateStaff = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "teacher" },
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete staff member
// @route DELETE /api/staff/:id
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({ _id: req.params.id, role: "teacher" });
    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    res.json({ message: "Staff member removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStaff, addStaff, updateStaff, deleteStaff };
