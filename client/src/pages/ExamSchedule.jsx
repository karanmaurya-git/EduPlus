import { useEffect, useState } from "react";
import { FiPlus, FiX, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const ExamSchedule = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ examName: "", targetClass: "", examDate: "", description: "" });
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/exams");
      setExams(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load exam schedule" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/exams", form);
      setToast({ type: "success", message: "Exam scheduled successfully!" });
      setShowModal(false);
      setForm({ examName: "", targetClass: "", examDate: "", description: "" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Failed to schedule exam" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this exam schedule entry?")) return;
    try {
      await api.delete(`/exams/${id}`);
      setToast({ type: "success", message: "Exam removed" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div className="stat-inline">
            <div className="label">Upcoming Assessments</div>
            <div className="value">{exams.length} Scheduled Exams</div>
          </div>
          <div className="stat-inline">
            <div className="label">Academic Session</div>
            <div className="value">2024-2025 Session</div>
          </div>
          {user?.role === "admin" ? (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> Schedule Exam
            </button>
          ) : (
            <div className="small-muted">Only Admins can modify schedules</div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading exam schedule...</div>
      ) : exams.length === 0 ? (
        <div className="card empty-state">
          <h3>No exams scheduled yet.</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Target Class</th>
                <th>Exam Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((ex) => (
                <tr key={ex._id}>
                  <td>
                    <span className="badge badge-primary">{ex.examName}</span>
                  </td>
                  <td>{ex.targetClass}</td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <FiCalendar /> {ex.examDate}
                    </span>
                  </td>
                  <td>{ex.description || "—"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    {(user?.role === "admin" || user?.role === "teacher") && (
                      <Link to="/sessional-marks" className="btn btn-outline">
                        Enter Marks
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <button className="btn-icon absent" onClick={() => handleDelete(ex._id)}>
                        <FiX />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <span>Schedule New Exam</span>
              <button
                className="btn-icon"
                style={{ marginLeft: "auto" }}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-fields">
                <div className="field">
                  <label>Exam Name</label>
                  <input name="examName" value={form.examName} onChange={handleChange} required />
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Target Class</label>
                    <input
                      name="targetClass"
                      value={form.targetClass}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Exam Date</label>
                    <input
                      name="examDate"
                      placeholder="DD/MM/YYYY"
                      value={form.examDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSchedule;
