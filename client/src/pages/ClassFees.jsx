import { useState } from "react";
import { FiDownload, FiCheckCircle } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ClassFees = () => {
  const { user } = useAuth();
  const now = new Date();
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    month: MONTHS[now.getMonth()],
    year: now.getFullYear(),
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const { data: resp } = await api.get("/fees", { params: filters });
      setData(resp);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load fee ledger" });
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (row) => {
    try {
      await api.put(`/fees/${row._id}`, {
        totalAmount: row.totalAmount || 0,
        paidAmount: row.totalAmount || 0,
        settlementStatus: "PAID",
      });
      setToast({ type: "success", message: "Payment updated!" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Update failed" });
    }
  };

  const pending = data ? data.ledger.filter((l) => l.settlementStatus !== "PAID").length : 0;
  const cleared = data ? data.ledger.length - pending : 0;

  const handleDownloadDefaulters = () => {
    if (!data) return;

    const defaulters = data.ledger.filter((l) => l.settlementStatus !== "PAID");
    if (defaulters.length === 0) {
      setToast({
        type: "error",
        message: "No defaulters found for this filter — nothing to download.",
      });
      return;
    }

    const header = ["Roll No", "Student Name", "Payable", "Paid", "Balance Due", "Status"];
    const rows = defaulters.map((d) => [
      d.rollNo || "N/A",
      d.name,
      d.totalAmount,
      d.paidAmount,
      d.balanceDue,
      d.settlementStatus,
    ]);

    const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
    const csvContent = [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Defaulters_${filters.class || "All"}-${filters.section || "All"}_${
      filters.month
    }_${filters.year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      type: "success",
      message: `Downloaded ${defaulters.length} defaulter record(s).`,
    });
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Class Fees</h1>

      <div className="card">
        <div className="toolbar">
          <div className="field">
            <label>Target Class</label>
            <input name="class" value={filters.class} onChange={handleChange} placeholder="10" />
          </div>
          <div className="field">
            <label>Section</label>
            <input name="section" value={filters.section} onChange={handleChange} placeholder="A" />
          </div>
          <div className="field">
            <label>Billing Month</label>
            <select name="month" value={filters.month} onChange={handleChange}>
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Academic Year</label>
            <input name="year" value={filters.year} onChange={handleChange} />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Load Ledger"}
          </button>
        </div>
      </div>

      {!data ? (
        <div className="card empty-state">
          <h3>Enter Class details above to view the fee ledger.</h3>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div className="stat-inline">
                <div className="label">Class Collection</div>
                <div className="value">₹{data.actualRevenue}</div>
              </div>
              <div className="stat-inline">
                <div className="label">Clearance Rate</div>
                <div className="value">
                  {cleared} / {data.ledger.length} Students
                </div>
              </div>
              <div className="small-muted">
                Records for {filters.month} {filters.year} session.
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Payable</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.map((row) => (
                  <tr key={row._id}>
                    <td>{row.rollNo || "—"}</td>
                    <td className="cell-name">{row.name}</td>
                    <td>₹{row.totalAmount}</td>
                    <td>₹{row.paidAmount}</td>
                    <td>₹{row.balanceDue}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.settlementStatus === "PAID" ? "badge-green" : "badge-red"
                        }`}
                      >
                        {row.settlementStatus}
                      </span>
                    </td>
                    <td>
                      {user?.role === "admin" && row.settlementStatus !== "PAID" ? (
                        <button className="btn btn-outline" onClick={() => markPaid(row)}>
                          <FiCheckCircle /> Mark Paid
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={handleDownloadDefaulters}>
            <FiDownload /> Download Defaulters List
          </button>
        </>
      )}
    </div>
  );
};

export default ClassFees;
