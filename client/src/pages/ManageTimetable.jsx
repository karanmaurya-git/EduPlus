import { useState } from "react";
import { FiBookOpen, FiX, FiTrash2 } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const ManageTimetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filters, setFilters] = useState({ class: "", section: "" });
  const [grid, setGrid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { day, period }
  const [form, setForm] = useState({
    subjectName: "",
    subjectCode: "",
    subjectType: "Theory",
    facultyName: "",
    facultyCode: "",
    department: "",
  });

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const load = async () => {
    if (!filters.class || !filters.section) {
      setToast({ type: "error", message: "Enter Class and Section first" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/timetable", { params: filters });
      setGrid(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load timetable" });
    } finally {
      setLoading(false);
    }
  };

  const openCell = (day, period, existing) => {
    if (!isAdmin) return;
    setModal({ day, period });
    setForm(
      existing || {
        subjectName: "",
        subjectCode: "",
        subjectType: "Theory",
        facultyName: "",
        facultyCode: "",
        department: "",
      }
    );
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post("/timetable/assign", {
        class: filters.class,
        section: filters.section,
        day: modal.day,
        period: modal.period,
        ...form,
      });
      setToast({ type: "success", message: "Lecture assigned successfully!" });
      setModal(null);
      load();
    } catch (err) {
      setToast({ type: "error", message: "Failed to assign lecture" });
    }
  };

  const handleDeleteSlot = async (e, slotId) => {
    e.stopPropagation(); // don't trigger the cell's onClick (which opens the assign modal)
    if (!window.confirm("Remove this lecture assignment?")) return;
    try {
      await api.delete(`/timetable/${slotId}`);
      setToast({ type: "success", message: "Slot cleared successfully!" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Failed to clear slot" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Timetable Management</h1>

      <div className="card">
        <div className="toolbar">
          <div className="field">
            <label>Target Class</label>
            <input name="class" value={filters.class} onChange={handleChange} placeholder="e.g. Grade 10" />
          </div>
          <div className="field">
            <label>Section</label>
            <input name="section" value={filters.section} onChange={handleChange} placeholder="e.g. A" />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Load Timetable Grid"}
          </button>
        </div>
      </div>

      {!grid ? (
        <div className="card empty-state">
          <h3>Enter Class and Section details above to start creating the timetable.</h3>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div className="stat-inline">
                <div className="label">Current Target</div>
                <div className="value">
                  {filters.class} - {filters.section}
                </div>
              </div>
              <div className="stat-inline">
                <div className="label">Configuration</div>
                <div className="value">{grid.periods.length} Daily Slots</div>
              </div>
              <div className="small-muted">
                {isAdmin
                  ? "Click on any cell below to assign a subject and faculty member."
                  : "View only — only Admins can modify the timetable."}
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="timetable-grid">
              <thead>
                <tr>
                  <th>Day / Time</th>
                  {grid.periods.map((p) => (
                    <th key={p}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.days.map((day) => (
                  <tr key={day}>
                    <td className="day-label">{day}</td>
                    {grid.periods.map((period) => {
                      const cell = grid.grid[day][period];
                      return (
                        <td key={period}>
                          <div
                            className={`slot-cell${cell ? " slot-filled" : ""}`}
                            onClick={() => openCell(day, period, cell)}
                          >
                            {cell ? (
                              <>
                                {isAdmin && (
                                  <button
                                    className="slot-delete-btn"
                                    onClick={(e) => handleDeleteSlot(e, cell._id)}
                                    title="Remove this lecture"
                                  >
                                    <FiTrash2 />
                                  </button>
                                )}
                                <span>{cell.subjectCode || cell.subjectName}</span>
                                <span className="fname">{cell.facultyName}</span>
                              </>
                            ) : (
                              "+"
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="section-heading">Subject Assignment Summary</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Type</th>
                  <th>Subject Name</th>
                  <th>Code</th>
                  <th>Faculty</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {grid.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                      No subjects assigned yet.
                    </td>
                  </tr>
                ) : (
                  grid.entries.map((e, i) => (
                    <tr key={e._id}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="badge badge-primary">{e.subjectType}</span>
                      </td>
                      <td>{e.subjectName}</td>
                      <td>{e.subjectCode}</td>
                      <td>{e.facultyName}</td>
                      <td>{e.department}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <FiBookOpen /> Assign Lecture: {modal.day} - {modal.period}
              <button
                className="btn-icon"
                style={{ marginLeft: "auto" }}
                onClick={() => setModal(null)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-fields">
                <div className="field">
                  <label>Subject Name</label>
                  <input
                    name="subjectName"
                    value={form.subjectName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Subject Code</label>
                    <input
                      name="subjectCode"
                      value={form.subjectCode}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="field">
                    <label>Subject Type</label>
                    <select
                      name="subjectType"
                      value={form.subjectType}
                      onChange={handleFormChange}
                    >
                      <option>Theory</option>
                      <option>Practical</option>
                      <option>Lab</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Faculty Name</label>
                  <input
                    name="facultyName"
                    value={form.facultyName}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Faculty Code</label>
                    <input
                      name="facultyCode"
                      value={form.facultyCode}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="field">
                    <label>Department</label>
                    <input
                      name="department"
                      value={form.department}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTimetable;
