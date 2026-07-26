require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Notice = require("../models/Notice");
const Exam = require("../models/Exam");
const Event = require("../models/Event");

const seed = async () => {
  await connectDB();

  console.log("Clearing existing users...");
  await User.deleteMany({});
  await Notice.deleteMany({});
  await Exam.deleteMany({});
  await Event.deleteMany({});

  console.log("Creating System Admin...");
  await User.create({
    name: "System Admin",
    email: "admin@school.com",
    password: "admin123",
    role: "admin",
    adminId: "SYSTEM_ADMIN",
    accessLevel: "Full Control (Root)",
    dutyStation: "Central Administration",
    accessProtocol: "ADMIN_SECURE_V1",
  });

  console.log("Creating Teacher...");
  await User.create({
    name: "Charu Sarswat",
    email: "charusaraswat639649@gmail.com",
    password: "teacher123",
    role: "teacher",
    teacherId: "123456",
    primarySubject: "Math",
    qualification: "PHD",
    employeeType: "Academic Faculty",
    experience: "4",
    department: "Math",
    payrollId: "PAY_123456",
    contractStatus: "ACTIVE",
    accessProtocol: "TEACHER_SECURE_V1",
  });

  console.log("Creating Students...");
  await User.create([
    {
      name: "Ankit",
      email: "g@gmail.com",
      password: "student123",
      role: "student",
      rollNo: "4",
      class: "10",
      section: "A",
      bloodGroup: "A+",
      guardianContact: "9675700000",
      fatherName: "Mr neera",
      dob: "22/05/2018",
      religion: "HINDUISM",
      gender: "MALE",
      currentAddress: "Nagla bans post kumarpur Hathras",
      enrollmentNo: "4",
    },
    {
      name: "Ayush",
      email: "a@gmail.com",
      password: "student123",
      role: "student",
      rollNo: "5",
      class: "3",
      section: "C",
      guardianContact: "9875706630",
    },
    {
      name: "Charu Sarswat",
      email: "charu@school.com",
      password: "student123",
      role: "student",
      rollNo: "2200330100078",
      class: "Grade 12",
      section: "A",
      guardianContact: "9875706630",
    },
    {
      name: "Ankit Kumar",
      email: "ankit@school.com",
      password: "student123",
      role: "student",
      rollNo: "LO1001",
    },
  ]);

  console.log("Creating sample Notice...");
  const admin = await User.findOne({ role: "admin" });
  await Notice.create({
    title: "ANNUAL SPORTS MEET 2024",
    content: "The annual sports meet will be held on 15th May. Registrations open now.",
    audience: "EVERYONE",
    publishedBy: admin._id,
  });

  console.log("Creating sample Exams...");
  await Exam.create([
    {
      examName: "UNIT TEST",
      targetClass: "3",
      examDate: "24/04/2026",
      description: "Automated schedule for UNIT_TEST",
    },
    {
      examName: "MID TERM",
      targetClass: "10th",
      examDate: "14/05/2024",
      description: "Chemistry Sessional",
    },
    {
      examName: "Half Yearly Examination",
      targetClass: "All Classes",
      examDate: "25/08/2026",
      description: "Primary & Secondary Wings",
    },
    {
      examName: "Summer Project Submission",
      targetClass: "All Classes",
      examDate: "12/09/2026",
      description: "Final deadline for all classes",
    },
  ]);

  console.log("Creating sample Events & Holidays...");
  await Event.create([
    {
      title: "Labour Day Holiday",
      type: "holiday",
      date: "2026-08-01",
      description: "School remains closed",
      createdBy: admin._id,
    },
    {
      title: "Annual Sports Meet 2026",
      type: "event",
      date: "2026-08-15",
      description: "Main Ground, 9:00 AM onwards",
      createdBy: admin._id,
    },
  ]);

  console.log("Seed complete!");
  console.log("---------------------------------------------------");
  console.log("Admin login   -> admin@school.com / admin123");
  console.log("Teacher login -> charusaraswat639649@gmail.com / teacher123");
  console.log("Student login -> roll no. 4 / student123 (Ankit)");
  console.log("---------------------------------------------------");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
