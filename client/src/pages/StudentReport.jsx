import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import StudentReportView from "../components/StudentReportView";

const StudentReport = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [studentRes, attRes, marksRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/attendance/student/${id}`),
          api.get(`/marks/student/${id}`),
        ]);
        setStudent(studentRes.data);
        setAttendance(attRes.data);
        setMarks(marksRes.data);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load report" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="breadcrumb">Home / Students / Attendance &amp; Results</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Detailed Academic Report</h1>
        <Link to={`/students/${id}`} className="btn btn-outline">
          <FiArrowLeft /> Back to Student
        </Link>
      </div>

      {!student ? (
        <div className="loading-text">Loading student...</div>
      ) : (
        <StudentReportView student={student} attendance={attendance} marks={marks} loading={loading} />
      )}
    </div>
  );
};

export default StudentReport;
