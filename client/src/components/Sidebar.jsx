import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiClipboard,
  FiCalendar,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiLogOut,
} from "react-icons/fi";
import { FaRupeeSign, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid, roles: ["admin", "teacher", "student"] },
  { to: "/profile", label: "My Profile", icon: FiUser, roles: ["admin", "teacher", "student"] },
  { to: "/students", label: "Students", icon: FiUsers, roles: ["admin", "teacher"] },
  { to: "/attendance", label: "Attendance", icon: FiUserCheck, roles: ["admin", "teacher"] },
  {
    to: "/attendance-log",
    label: "Attendance Log",
    icon: FiClipboard,
    roles: ["admin", "teacher", "student"],
  },
  {
    to: "/manage-timetable",
    label: "Manage Timetable",
    icon: FiCalendar,
    roles: ["admin", "teacher", "student"],
  },
  { to: "/class-fees", label: "Class Fees", icon: FaRupeeSign, roles: ["admin", "teacher"] },
  {
    to: "/sessional-marks",
    label: "Sessional Marks",
    icon: FaGraduationCap,
    roles: ["admin", "teacher", "student"],
  },
  { to: "/notices", label: "Notices", icon: FiBell, roles: ["admin", "teacher", "student"] },
  {
    to: "/academic-materials",
    label: "Assignments & Papers",
    icon: FiBookOpen,
    roles: ["admin", "teacher", "student"],
  },
  { to: "/staff-management", label: "Staff Management", icon: FiBriefcase, roles: ["admin"] },
  { to: "/staff-attendance", label: "Staff Attendance", icon: FiClipboard, roles: ["admin"] },
  { to: "/finance-control", label: "Finance Control", icon: FaRupeeSign, roles: ["admin"] },
  { to: "/exam-schedule", label: "Exam Schedule", icon: FaGraduationCap, roles: ["admin", "teacher", "student"] },
  {
    to: "/academic-results",
    label: "Academic Results",
    icon: FaGraduationCap,
    roles: ["admin", "teacher", "student"],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || "student";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg,#6a5cf0,#a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
          }}
        >
          E+
        </div>
        <h1>EduPlus Portal</h1>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        <FiLogOut />
        <span>Logout Account</span>
      </button>
    </aside>
  );
};

export default Sidebar;
