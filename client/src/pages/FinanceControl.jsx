import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FinanceControl = () => {
  const [tab, setTab] = useState("fees"); // fees | salary
  const now = new Date();
  const [filters, setFilters] = useState({
    month: MONTHS[now.getMonth()],
    year: now.getFullYear(),
    class: "All Classes",
    section: "All Sections",
  });
  const [feeData, setFeeData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const loadFees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/fees", { params: filters });
      setFeeData(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load fee ledger" });
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff");
      setStaffList(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load staff salary ledger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "fees") loadFees();
    else loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const totalRevenue = feeData ? feeData.actualRevenue : 0;
  const totalExpenses = staffList.reduce((s, t) => s + (t.monthlySalary || 0), 0);

  const updatePayment = async (row) => {
    const amount = window.prompt(`Enter paid amount for ${row.name}`, row.paidAmount);
    if (amount === null) return;
    try {
      await api.put(`/fees/${row._id}`, {
        totalAmount: row.totalAmount,
        paidAmount: Number(amount),
        settlementStatus: Number(amount) >= row.totalAmount ? "PAID" : "PARTIAL",
      });
      setToast({ type: "success", message: "Payment record updated!" });
      loadFees();
    } catch (err) {
      setToast({ type: "error", message: "Update failed" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Finance Control</h1>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))" }}>
        <div className="stat-card">
          <div className="stat-label">Actual Revenue</div>
          <div className="stat-value">₹{totalRevenue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Actual Expenses</div>
          <div className="stat-value">₹{totalExpenses}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--border)", marginBottom: 18 }}>
          <button
            onClick={() => setTab("fees")}
            style={{
              background: "none",
              border: "none",
              padding: "10px 4px",
              fontWeight: 700,
              color: tab === "fees" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: tab === "fees" ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            Student Fee Ledger
          </button>
          <button
            onClick={() => setTab("salary")}
            style={{
              background: "none",
              border: "none",
              padding: "10px 4px",
              fontWeight: 700,
              color: tab === "salary" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: tab === "salary" ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            Staff Salary Ledger
          </button>
        </div>

        {tab === "fees" ? (
          <div className="toolbar">
            <div className="field">
              <label>Month</label>
              <select name="month" value={filters.month} onChange={handleChange}>
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Year</label>
              <input name="year" value={filters.year} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Class</label>
              <input name="class" value={filters.class} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Section</label>
              <input name="section" value={filters.section} onChange={handleChange} />
            </div>
            <button className="btn btn-primary" onClick={loadFees}>
              <FiSearch /> Apply Filter
            </button>
          </div>
        ) : (
          <div className="field" style={{ maxWidth: 320 }}>
            <div className="login-input" style={{ borderRadius: 10 }}>
              <FiSearch />
              <input
                placeholder="Search ledger..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-text">Loading ledger...</div>
      ) : tab === "fees" ? (
        !feeData || feeData.ledger.length === 0 ? (
          <div className="card empty-state">
            <h3>No fee records found for this filter.</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student Identity</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Settlement Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeData.ledger.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <div className="cell-name">{row.name}</div>
                      <div className="cell-sub">ID: {row.rollNo || "N/A"}</div>
                    </td>
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
                      <button className="btn btn-outline" onClick={() => updatePayment(row)}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : staffList.length === 0 ? (
        <div className="card empty-state">
          <h3>No staff salary records found.</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Monthly Salary</th>
                <th>Contract Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList
                .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
                .map((s) => (
                  <tr key={s._id}>
                    <td className="cell-name">{s.name}</td>
                    <td>{s.teacherId || "—"}</td>
                    <td>{s.department || "—"}</td>
                    <td>₹{s.monthlySalary || 0}</td>
                    <td>
                      <span className="badge badge-green">{s.contractStatus}</span>
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

export default FinanceControl;
