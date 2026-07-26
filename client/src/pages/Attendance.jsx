import { useState } from "react";
import { FiSearch, FiCheck, FiX, FiClock } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import { Link } from "react-router-dom";

const today = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(
    2,
    "0"
  )}/${d.getFullYear()}`;
};

const Attendance = () => {
  const [filters, setFilters] = useState({
    date: today(),
    class: "",
    section: "",
    period: "Daily (Full Day)",
  });
  const [rollList, setRollList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const loadRollList = async () => {
    if (!filters.class || !filters.section) {
      setToast({ type: "error", message: "Enter Class and Section first" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/attendance/roll", {
        params: {
          class: filters.class,
          section: filters.section,
          date: filters.date,
          period: filters.period,
        },
      });
      setRollList(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load roll list" });
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setRollList({
      ...rollList,
      rollList: rollList.rollList.map((s) => (s._id === studentId ? { ...s, status } : s)),
    });
  };

  const markAllPresent = () => {
    setRollList({
      ...rollList,
      rollList: rollList.rollList.map((s) => ({ ...s, status: "present" })),
    });
  };

  const finalizeAndSave = async () => {
    setSaving(true);
    try {
      const entries = rollList.rollList.map((s) => ({ studentId: s._id, status: s.status }));
      await api.post("/attendance/save", {
        class: filters.class,
        section: filters.section,
        date: filters.date,
        period: filters.period,
        entries,
      });
      setToast({ type: "success", message: "Attendance saved successfully!" });
    } catch (err) {
      setToast({ type: "error", message: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Class Attendance Entry</h1>

      <div className="card">
        <div className="toolbar">
          <div className="field">
            <label>Select Date</label>
            <input
              type="text"
              name="date"
              placeholder="MM/DD/YYYY"
              value={filters.date}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Class</label>
            <input name="class" value={filters.class} onChange={handleChange} placeholder="Ex: 3" />
          </div>
          <div className="field">
            <label>Section</label>
            <input
              name="section"
              value={filters.section}
              onChange={handleChange}
              placeholder="Ex: A"
            />
          </div>
          <div className="field">
            <label>Period</label>
            <select name="period" value={filters.period} onChange={handleChange}>
              <option>Daily (Full Day)</option>
              <option>Period 1</option>
              <option>Period 2</option>
              <option>Period 3</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={loadRollList} disabled={loading}>
            <FiSearch /> {loading ? "Loading..." : "Load Roll List"}
          </button>
        </div>
      </div>

      {!rollList ? (
        <div className="card empty-state">
          <h3>Enter Class details above to load the roll list.</h3>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div className="stat-inline">
                <div className="label">Current Selection</div>
                <div className="value">
                  {filters.class} ({filters.section})
                </div>
              </div>
              <div className="stat-inline">
                <div className="label">Total Students</div>
                <div className="value">{rollList.totalStudents} Registered</div>
              </div>
              <div className="stat-inline">
                <div className="label">Marking Date</div>
                <div className="value">{filters.date}</div>
              </div>
              <button className="btn btn-green" onClick={markAllPresent}>
                Mark All As Present
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name &amp; Report</th>
                  <th>Current Status</th>
                  <th>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {rollList.rollList.map((s) => (
                  <tr key={s._id}>
                    <td>{s.rollNo || "—"}</td>
                    <td>
                      <Link to="/attendance-log" className="link-btn">
                        {s.name}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === "present"
                            ? "badge-green"
                            : s.status === "absent"
                            ? "badge-red"
                            : "badge-yellow"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className={`btn-icon present${s.status === "present" ? " selected" : ""}`}
                          onClick={() => setStatus(s._id, "present")}
                          title="Present"
                        >
                          <FiCheck />
                        </button>
                        <button
                          className={`btn-icon absent${s.status === "absent" ? " selected" : ""}`}
                          onClick={() => setStatus(s._id, "absent")}
                          title="Absent"
                        >
                          <FiX />
                        </button>
                        <button
                          className={`btn-icon late${s.status === "late" ? " selected" : ""}`}
                          onClick={() => setStatus(s._id, "late")}
                          title="Late"
                        >
                          <FiClock />
                        </button>
                        <button className="btn btn-outline" style={{ padding: "8px 12px" }}>
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button className="btn btn-primary" onClick={finalizeAndSave} disabled={saving}>
              {saving ? "Saving..." : "Finalize & Save Roll"}
            </button>
            <button className="btn btn-outline" onClick={() => setRollList(null)}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
