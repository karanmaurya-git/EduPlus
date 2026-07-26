const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc Register a new user (used by Sign Up + Admin "Add Student"/"Add Staff")
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNo, class: cls, section } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      rollNo,
      class: cls,
      section,
      accessProtocol:
        (role || "student") === "admin"
          ? "ADMIN_SECURE_V1"
          : (role || "student") === "teacher"
          ? "TEACHER_SECURE_V1"
          : "STUDENT_SECURE_V1",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login with roll number/email + password (role aware for Student vs Staff/Admin tab)
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { identifier, password, loginType } = req.body;
    // identifier => roll number OR email

    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { rollNo: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (loginType === "student" && user.role !== "student") {
      return res.status(403).json({ message: "Please use Staff/Admin login tab" });
    }
    if (loginType === "staff" && user.role === "student") {
      return res.status(403).json({ message: "Please use Student login tab" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo,
      class: user.class,
      section: user.section,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current logged-in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc Update own profile (any logged-in role)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    delete updates.email;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };

