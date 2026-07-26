import { FiPrinter } from "react-icons/fi";

const StudentReportView = ({ student, attendance, marks, loading }) => {
  return (
    <>
      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div className="stat-inline">
            <div className="label">Student Profile</div>
            <div className="value">{student.name}</div>
          </div>
          <div className="stat-inline">
            <div className="label">Roll Number</div>
            <div className="value">{student.rollNo || "N/A"}</div>
          </div>
          <div className="stat-inline">
            <div className="label">Class / Section</div>
            <div className="value">
              {student.class} - {student.section}
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <FiPrinter /> Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading report...</div>
      ) : (
        <>
          <h3 className="section-heading">Attendance Summary</h3>
          {!attendance || attendance.records.length === 0 ? (
            <div className="card empty-state">
              <h3>No attendance history recorded yet.</h3>
            </div>
          ) : (
            <>
              <div
                className="stat-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
              >
                <div className="stat-card">
                  <div className="stat-label">Total Records</div>
                  <div className="stat-value">{attendance.totalRecords}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Days Present</div>
                  <div className="stat-value">{attendance.totalPresent}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Attendance %</div>
                  <div className="stat-value">{attendance.percentage}%</div>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Period</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.records.slice(0, 15).map((r) => (
                      <tr key={r._id}>
                        <td>{r.date}</td>
                        <td>{r.period}</td>
                        <td>
                          <span
                            className={`badge ${
                              r.status === "present"
                                ? "badge-green"
                                : r.status === "absent"
                                ? "badge-red"
                                : "badge-yellow"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h3 className="section-heading">Sessional Marks</h3>
          {marks.length === 0 ? (
            <div className="card empty-state">
              <h3>No sessional marks recorded yet.</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Subject</th>
                    <th>Marks Obtained</th>
                    <th>Max Marks</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m) => (
                    <tr key={m._id}>
                      <td>{m.assessmentType}</td>
                      <td>{m.subject}</td>
                      <td>{m.marksObtained}</td>
                      <td>{m.maxMarks}</td>
                      <td>{m.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StudentReportView;
