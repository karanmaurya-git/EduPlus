import { useState } from "react";
import { FiPrinter, FiDownload } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AttendanceLog = () => {
  const now = new Date();
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    month: MONTHS[now.getMonth()],
    year: now.getFullYear(),
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const shiftMonth = (dir) => {
    const idx = MONTHS.indexOf(filters.month);
    let newIdx = idx + dir;
    let year = Number(filters.year);
    if (newIdx < 0) {
      newIdx = 11;
      year -= 1;
    } else if (newIdx > 11) {
      newIdx = 0;
      year += 1;
    }
    setFilters({ ...filters, month: MONTHS[newIdx], year });
  };

  const shiftYear = (dir) => setFilters({ ...filters, year: Number(filters.year) + dir });

  const load = async () => {
    if (!filters.class || !filters.section) {
      setToast({ type: "error", message: "Enter Class and Section first" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/attendance/summary", { params: filters });
      setSummary(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load attendance sheet" });
    } finally {
      setLoading(false);
    }
  };

  const statusMark = (status) => {
    if (status === "present") return { text: "✓", color: "var(--green)" };
    if (status === "absent") return { text: "✕", color: "var(--red)" };
    if (status === "late") return { text: "L", color: "var(--yellow)" };
    if (status === "holiday") return { text: "★", color: "var(--primary)" };
    return { text: "-", color: "var(--text-muted)" };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSheet = () => {
    if (!summary || summary.sheet.length === 0) {
      setToast({ type: "error", message: "Load an attendance sheet first — nothing to download." });
      return;
    }

    const dayNumbers = Array.from({ length: summary.daysInMonth }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );
    const header = ["Student", ...dayNumbers];
    const rows = summary.sheet.map((row) => [
      row.name,
      ...dayNumbers.map((d) => row.days[d] || "-"),
    ]);

    const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
    const csvContent = [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AttendanceSheet_${filters.class || "All"}-${filters.section || "All"}_${
      filters.month
    }_${filters.year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({ type: "success", message: "Attendance sheet downloaded!" });
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="breadcrumb">
        Students Attendance Management • Students Attendance • Students Attendance Summary
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-primary">Attendance Sheet</button>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-icon" onClick={handlePrint} title="Print attendance sheet">
            <FiPrinter />
          </button>
          <button className="btn-icon" onClick={handleDownloadSheet} title="Download as CSV">
            <FiDownload />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div className="field">
              <label>Class</label>
              <input name="class" value={filters.class} onChange={handleChange} placeholder="Ex: 10" />
            </div>
            <div className="field">
              <label>Section</label>
              <input name="section" value={filters.section} onChange={handleChange} placeholder="Ex: A" />
            </div>
            <div className="field">
              <label>Select Month</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="btn-icon" onClick={() => shiftMonth(-1)}>‹</button>
                <strong>{filters.month}</strong>
                <button className="btn-icon" onClick={() => shiftMonth(1)}>›</button>
              </div>
            </div>
            <div className="field">
              <label>Select Year</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="btn-icon" onClick={() => shiftYear(-1)}>‹</button>
                <strong>{filters.year}</strong>
                <button className="btn-icon" onClick={() => shiftYear(1)}>›</button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span className="badge badge-green">Present</span>
            <span className="badge badge-red">Absent</span>
            <span className="badge badge-primary">Holiday</span>
            <button className="btn btn-outline" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Load Sheet"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading data...</div>
      ) : !summary ? (
        <div className="card empty-state">
          <h3>Enter Class and Section, then Load Sheet to view attendance.</h3>
        </div>
      ) : summary.sheet.length === 0 ? (
        <div className="card empty-state">
          <h3>No students found in {filters.class} - {filters.section}.</h3>
          <p>Try changing the Class or Section in the filters above.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Students</th>
                {Array.from({ length: summary.daysInMonth }, (_, i) => (
                  <th key={i}>{String(i + 1).padStart(2, "0")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.sheet.map((row) => (
                <tr key={row.studentId}>
                  <td className="cell-name">{row.name}</td>
                  {Array.from({ length: summary.daysInMonth }, (_, i) => {
                    const day = String(i + 1).padStart(2, "0");
                    const mark = statusMark(row.days[day]);
                    return (
                      <td key={i} style={{ textAlign: "center", color: mark.color, fontWeight: 700 }}>
                        {mark.text}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;
