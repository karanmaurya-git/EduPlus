import { useState } from "react";
import api from "../api/axios";
import Toast from "../components/Toast";

const Sessionaltypes = ["1st Sessional", "2nd Sessional", "3rd Sessional"];

const SessionalMarks = () => {
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    assessmentType: Sessionaltypes[0],
    subject: "",
  });
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const load = async () => {
    if (!filters.class || !filters.section || !filters.subject) {
      setToast({ type: "error", message: "Fill Class, Section and Subject first" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/marks", { params: filters });
      setLedger(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load marks ledger" });
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (id, field, value) => {
    setLedger({
      ...ledger,
      ledger: ledger.ledger.map((row) =>
        row._id === id
          ? {
              ...row,
              [field]: value,
              status:
                field === "marksObtained"
                  ? Number(value) >= row.maxMarks * 0.33
                    ? "PASS"
                    : "FAIL"
                  : row.status,
            }
          : row
      ),
    });
  };

  const finalize = async () => {
    setSaving(true);
    try {
      const entries = ledger.ledger.map((r) => ({
        _id: r._id,
        marksObtained: Number(r.marksObtained) || 0,
        maxMarks: Number(r.maxMarks) || 100,
        remarks: r.remarks,
      }));
      await api.post("/marks/save", { entries });
      setToast({ type: "success", message: "Marks finalized and saved successfully!" });
    } catch (err) {
      setToast({ type: "error", message: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Sessional Marks</h1>

      <div className="card">
        <div className="toolbar">
          <div className="field">
            <label>Target Class</label>
            <input name="class" value={filters.class} onChange={handleChange} placeholder="Class 3" />
          </div>
          <div className="field">
            <label>Section</label>
            <input name="section" value={filters.section} onChange={handleChange} placeholder="C" />
          </div>
          <div className="field">
            <label>Assessment Type</label>
            <select name="assessmentType" value={filters.assessmentType} onChange={handleChange}>
              {Sessionaltypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Subject</label>
            <input name="subject" value={filters.subject} onChange={handleChange} placeholder="math" />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Load Entry Ledger"}
          </button>
        </div>
      </div>

      {!ledger ? (
        <div className="card empty-state">
          <h3>Select Assessment and Class details to begin marking.</h3>
          <p>Make sure classes and students are correctly registered in the system.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div className="stat-inline">
                <div className="label">Current Subject Board</div>
                <div className="value">{filters.subject}</div>
              </div>
              <div className="stat-inline">
                <div className="label">Class Strength</div>
                <div className="value">{ledger.totalStudents} Total Students</div>
              </div>
              <button className="btn btn-primary" onClick={finalize} disabled={saving}>
                {saving ? "Saving..." : "Finalize Marks"}
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {ledger.ledger.map((row) => (
                  <tr key={row._id}>
                    <td>{row.rollNo || "—"}</td>
                    <td className="cell-name">{row.name}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="number"
                          className="marks-input"
                          value={row.marksObtained}
                          onChange={(e) => updateRow(row._id, "marksObtained", e.target.value)}
                        />
                        <span className={`badge ${row.status === "PASS" ? "badge-green" : "badge-red"}`}>
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="marks-input"
                        value={row.maxMarks}
                        onChange={(e) => updateRow(row._id, "maxMarks", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="remark-input"
                        placeholder="Add academic remark..."
                        value={row.remarks}
                        onChange={(e) => updateRow(row._id, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small-muted">Note: Percentage and grades will be auto-calculated upon saving.</p>
        </>
      )}
    </div>
  );
};

export default SessionalMarks;
