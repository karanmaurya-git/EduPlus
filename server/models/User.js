const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },

    profileImage: { type: String, default: "" },
    contactNumber: { type: String, default: "N/A" },
    accessProtocol: { type: String, default: "" },
    status: { type: String, default: "Active" },

    // ----- STUDENT SPECIFIC -----
    rollNo: { type: String, default: "" },
    class: { type: String, default: "Unassigned" },
    section: { type: String, default: "" },
    bloodGroup: { type: String, default: "N/A" },
    guardianContact: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    dob: { type: String, default: "" },
    religion: { type: String, default: "" },
    gender: { type: String, default: "" },
    permanentAddress: { type: String, default: "" },
    currentAddress: { type: String, default: "" },
    aadharNo: { type: String, default: "" },
    panCardNo: { type: String, default: "" },
    enrollmentNo: { type: String, default: "" },
    academicSession: { type: String, default: "2025-2026" },

    // ----- TEACHER SPECIFIC -----
    teacherId: { type: String, default: "" },
    primarySubject: { type: String, default: "" },
    employeeType: { type: String, default: "Academic Faculty" },
    qualification: { type: String, default: "" },
    experience: { type: String, default: "" },
    dutyStation: { type: String, default: "Main Campus" },
    department: { type: String, default: "" },
    reportingTo: { type: String, default: "HOD / Principal" },
    payrollId: { type: String, default: "" },
    contractStatus: { type: String, default: "PERMANENT" },
    monthlySalary: { type: Number, default: 0 },

    // ----- ADMIN SPECIFIC -----
    adminId: { type: String, default: "SYSTEM_ADMIN" },
    accessLevel: { type: String, default: "Full Control (Root)" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
