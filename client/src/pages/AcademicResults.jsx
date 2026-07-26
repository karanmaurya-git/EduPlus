import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import StudentReportView from "../components/StudentReportView";
import { useAuth } from "../context/AuthContext";

const AcademicResults = () => {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "teacher";
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(isStaff ? null : user);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isStaff) {
      api
        .get("/students")
        .then(({ data }) => setStudents(data))
        .catch(() => setToast({ type: "error", message: "Failed to load students" }));
    } else {
      loadReport(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReport = async (studentId) => {
    setLoading(true);
    try {
      const [attRes, marksRes] = await Promise.all([
        api.get(`/attendance/student/${studentId}`),
        api.get(`/marks/student/${studentId}`),
      ]);
      setAttendance(attRes.data);
      setMarks(marksRes.data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load report" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (s) => {
    setSelected(s);
    loadReport(s._id);
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {isStaff && !selected ? (
        <>
          <h1 className="page-title">Academic Results</h1>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No.</th>
                  <th>Class / Section</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td className="cell-name">{s.name}</td>
                    <td>{s.rollNo || "—"}</td>
                    <td>{s.class && s.section ? `${s.class} - ${s.section}` : "Unassigned"}</td>
                    <td>
                      <button className="btn btn-outline" onClick={() => handleSelect(s)}>
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="breadcrumb">Home / Academic Results / Student Report</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className="page-title">Detailed Academic Report</h1>
            {isStaff && (
              <button className="btn btn-outline" onClick={() => setSelected(null)}>
                <FiArrowLeft /> Back to List
              </button>
            )}
          </div>

          <StudentReportView
            student={selected}
            attendance={attendance}
            marks={marks}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default AcademicResults;
