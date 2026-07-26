import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import StudentProfile from "./pages/StudentProfile";
import StudentReport from "./pages/StudentReport";
import StudentFees from "./pages/StudentFees";
import StudentDocuments from "./pages/StudentDocuments";
import Attendance from "./pages/Attendance";
import AttendanceLog from "./pages/AttendanceLog";
import ManageTimetable from "./pages/ManageTimetable";
import ClassFees from "./pages/ClassFees";
import SessionalMarks from "./pages/SessionalMarks";
import Notices from "./pages/Notices";
import AcademicMaterials from "./pages/AcademicMaterials";
import StaffManagement from "./pages/StaffManagement";
import StaffAttendance from "./pages/StaffAttendance";
import FinanceControl from "./pages/FinanceControl";
import ExamSchedule from "./pages/ExamSchedule";
import AcademicResults from "./pages/AcademicResults";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />

      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <StudentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/profile"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/report"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <StudentReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/fees"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <StudentFees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/documents"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <StudentDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance-log"
        element={
          <ProtectedRoute>
            <AttendanceLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-timetable"
        element={
          <ProtectedRoute>
            <ManageTimetable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/class-fees"
        element={
          <ProtectedRoute roles={["admin", "teacher"]}>
            <ClassFees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessional-marks"
        element={
          <ProtectedRoute>
            <SessionalMarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <Notices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-materials"
        element={
          <ProtectedRoute>
            <AcademicMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-management"
        element={
          <ProtectedRoute roles={["admin"]}>
            <StaffManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-attendance"
        element={
          <ProtectedRoute roles={["admin"]}>
            <StaffAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-control"
        element={
          <ProtectedRoute roles={["admin"]}>
            <FinanceControl />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam-schedule"
        element={
          <ProtectedRoute>
            <ExamSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-results"
        element={
          <ProtectedRoute>
            <AcademicResults />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
