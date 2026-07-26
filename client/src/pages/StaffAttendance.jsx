import { useState, useEffect } from "react";
import { FiSave, FiCheck, FiX, FiClock, FiAlertCircle } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const today = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(
    2,
    "0"
  )}/${d.getFullYear()}`;
};

const StaffAttendance = () => {
  const [date, setDate] = useState(today());
  const [registry, setRegistry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async (d = date) => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff-attendance", { params: { date: d } });
      setRegistry(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load staff registry" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    load(e.target.value);
  };

  const setStatus = (id, status) => {
    setRegistry({
      ...registry,
      registry: registry.registry.map((s) => (s._id === id ? { ...s, status } : s)),
    });
  };

  const saveLedger = async () => {
    setSaving(true);
    try {
      const entries = registry.registry.map((s) => ({ staffId: s._id, status: s.status }));
      await api.post("/staff-attendance/save", { date, entries });
      setToast({ type: "success", message: "Attendance ledger saved successfully!" });
    } catch (err) {
      setToast({ type: "error", message: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Staff Daily Attendance Registry</h1>

      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div className="field">
            <label>Attendance Date</label>
            <input type="text" value={date} onChange={handleDateChange} placeholder="MM/DD/YYYY" />
          </div>
          <div className="stat-inline">
            <div className="label">Staff Strength</div>
            <div className="value">{registry?.totalActive ?? 0} Active Members</div>
          </div>
          <button className="btn btn-primary" onClick={saveLedger} disabled={saving || !registry}>
            <FiSave /> {saving ? "Saving..." : "Save Attendance Ledger"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading staff registry...</div>
      ) : !registry || registry.registry.length === 0 ? (
        <div className="card empty-state">
          <h3>No active staff members found.</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Staff ID</th>
                <th>Current Status</th>
                <th>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {registry.registry.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="cell-name">{s.name}</div>
                    <div className="cell-sub">{s.primarySubject || "Faculty"}</div>
                  </td>
                  <td>{s.teacherId || "—"}</td>
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
                      >
                        <FiCheck />
                      </button>
                      <button
                        className={`btn-icon absent${s.status === "absent" ? " selected" : ""}`}
                        onClick={() => setStatus(s._id, "absent")}
                      >
                        <FiX />
                      </button>
                      <button
                        className={`btn-icon late${s.status === "late" ? " selected" : ""}`}
                        onClick={() => setStatus(s._id, "late")}
                      >
                        <FiClock />
                      </button>
                      <button
                        className={`btn-icon late${s.status === "leave" ? " selected" : ""}`}
                        onClick={() => setStatus(s._id, "leave")}
                        title="Leave"
                      >
                        <FiAlertCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
