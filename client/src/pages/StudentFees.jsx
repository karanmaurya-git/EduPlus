import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const StudentFees = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [studentRes, feeRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/fees/student/${id}`),
        ]);
        setStudent(studentRes.data);
        setFeeData(feeRes.data);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load fee history" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="breadcrumb">Home / Students / Fee History</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Fee Payment History</h1>
        <Link to={`/students/${id}`} className="btn btn-outline">
          <FiArrowLeft /> Back to Student
        </Link>
      </div>

      {loading || !student ? (
        <div className="loading-text">Loading fee history...</div>
      ) : (
        <>
          <div className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div className="stat-inline">
                <div className="label">Student</div>
                <div className="value">{student.name}</div>
              </div>
              <div className="stat-inline">
                <div className="label">Total Paid (All Time)</div>
                <div className="value">₹{feeData?.totalPaid ?? 0}</div>
              </div>
              <div className="stat-inline">
                <div className="label">Total Due (All Time)</div>
                <div className="value" style={{ color: "var(--red)" }}>
                  ₹{feeData?.totalDue ?? 0}
                </div>
              </div>
            </div>
          </div>

          {!feeData || feeData.records.length === 0 ? (
            <div className="card empty-state">
              <h3>No fee records found for this student yet.</h3>
              <p>Records are created automatically once a Fee Ledger is loaded for their class.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeData.records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.month}</td>
                      <td>{r.year}</td>
                      <td>₹{r.totalAmount}</td>
                      <td>₹{r.paidAmount}</td>
                      <td>₹{r.totalAmount - r.paidAmount}</td>
                      <td>
                        <span
                          className={`badge ${
                            r.settlementStatus === "PAID" ? "badge-green" : "badge-red"
                          }`}
                        >
                          {r.settlementStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentFees;
