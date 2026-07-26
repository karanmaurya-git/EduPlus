import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiBriefcase, FiBell, FiUserCheck } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MONTH_ABBR = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

// Exam dates are stored as "DD/MM/YYYY"
const parseExamDate = (str) => {
  const parts = (str || "").split("/").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return { day: "--", month: "--", time: 0 };
  const [d, m, y] = parts;
  return { day: String(d).padStart(2, "0"), month: MONTH_ABBR[m - 1] || "--", time: new Date(y, m - 1, d).getTime() };
};

// Event dates are stored as "YYYY-MM-DD"
const parseEventDate = (str) => {
  const parts = (str || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return { day: "--", month: "--", time: 0 };
  const [y, m, d] = parts;
  return { day: String(d).padStart(2, "0"), month: MONTH_ABBR[m - 1] || "--", time: new Date(y, m - 1, d).getTime() };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [events, setEvents] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, examsRes, eventsRes, noticesRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/exams"),
          api.get("/events"),
          api.get("/notices"),
        ]);

        setStats(statsRes.data);

        const now = Date.now();
        const parsedExams = examsRes.data
          .map((ex) => ({ ...ex, ...parseExamDate(ex.examDate) }))
          .sort((a, b) => a.time - b.time);
        const upcomingExams = parsedExams.filter((e) => e.time >= now);
        setExams((upcomingExams.length ? upcomingExams : parsedExams).slice(0, 2));

        const parsedEvents = eventsRes.data
          .map((ev) => ({ ...ev, ...parseEventDate(ev.date) }))
          .sort((a, b) => a.time - b.time);
        const upcomingEvents = parsedEvents.filter((e) => e.time >= now);
        setEvents((upcomingEvents.length ? upcomingEvents : parsedEvents).slice(0, 2));

        setLatestNotice(noticesRes.data[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-text">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="page-title">Command Dashboard</h1>
      <p className="welcome-sub">
        Welcome back, <strong>{user?.name}</strong>. Here is your academic overview.
      </p>

      <div className="stat-grid">
        <div className="stat-card-bordered" style={{ borderTopColor: "var(--primary)" }}>
          <div className="stat-label-top">Active Students</div>
          <div className="stat-big-value">{stats?.totalStudents ?? 0}</div>
        </div>
        <div className="stat-card-bordered" style={{ borderTopColor: "var(--green)" }}>
          <div className="stat-label-top">Faculty Today</div>
          <div className="stat-big-value">{stats?.facultyAttendancePercent ?? 0}%</div>
        </div>
        <div className="stat-card-bordered" style={{ borderTopColor: "var(--gold)" }}>
          <div className="stat-label-top">Month Revenue</div>
          <div className="stat-big-value">₹{stats?.monthRevenue ?? 0}</div>
        </div>
        <div className="stat-card-bordered" style={{ borderTopColor: "var(--red)" }}>
          <div className="stat-label-top">Fee Arrears</div>
          <div className="stat-big-value">₹{stats?.feeArrears ?? 0}</div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* LEFT COLUMN */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <FiCalendar /> Academic Calendar &amp; Events
              </div>
              <Link to="/exam-schedule" className="panel-header-link">
                VIEW FULL CALENDAR
              </Link>
            </div>
            <div className="panel-body">
              <div className="calendar-columns">
                <div>
                  <div className="calendar-col-label">Upcoming Examinations</div>
                  {exams.length === 0 ? (
                    <p className="small-muted">No exams scheduled.</p>
                  ) : (
                    exams.map((ex) => (
                      <div className="calendar-item" key={ex._id}>
                        <div
                          className="calendar-date-badge"
                          style={{ background: "var(--red-bg)", color: "var(--red)" }}
                        >
                          <span className="day">{ex.day}</span>
                          <span className="mon">{ex.month}</span>
                        </div>
                        <div>
                          <div className="calendar-item-title">{ex.examName}</div>
                          <div className="calendar-item-sub">
                            {ex.description || `Class ${ex.targetClass}`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <div className="calendar-col-label">School Events &amp; Holidays</div>
                  {events.length === 0 ? (
                    <p className="small-muted">No events scheduled.</p>
                  ) : (
                    events.map((ev) => (
                      <div className="calendar-item" key={ev._id}>
                        <div
                          className="calendar-date-badge"
                          style={
                            ev.type === "holiday"
                              ? { background: "var(--green-bg)", color: "var(--green)" }
                              : { background: "var(--primary-light)", color: "var(--primary-dark)" }
                          }
                        >
                          <span className="day">{ev.day}</span>
                          <span className="mon">{ev.month}</span>
                        </div>
                        <div>
                          <div className="calendar-item-title">{ev.title}</div>
                          <div className="calendar-item-sub">{ev.description}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {(user?.role === "admin" || user?.role === "teacher") && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <FiBriefcase /> Fast Access Controls
                </div>
              </div>
              <div className="panel-body fast-access-grid">
                <Link to="/attendance" className="btn btn-primary">
                  <FiUserCheck /> Registry Marking
                </Link>
                {user?.role === "admin" && (
                  <Link to="/finance-control" className="btn btn-outline">
                    <FaRupeeSign /> Finance Ledger
                  </Link>
                )}
                <Link to="/notices" className="btn btn-outline">
                  <FiBell /> New Broadcast
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="panel dark">
            <div className="panel-header">
              <div className="panel-header-title">
                <FiBell /> Official Bulletin
              </div>
            </div>
            <div className="panel-body">
              {!latestNotice ? (
                <p className="small-muted">No announcements yet.</p>
              ) : (
                <>
                  <div className="bulletin-date-row">
                    <span className="bulletin-date">
                      {new Date(latestNotice.createdAt).toLocaleDateString()}
                    </span>
                    <span className="bulletin-by">
                      BY {(latestNotice.publishedBy?.name || "Admin").toUpperCase()}
                    </span>
                  </div>
                  <div className="bulletin-title">{latestNotice.title}</div>
                  <div className="bulletin-content">{latestNotice.content}</div>
                </>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-body">
              <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 800 }}>
                Emergency Helpline
              </h3>
              <div className="helpline-row">
                <span className="label">Admin Office:</span>
                <span className="phone">+91 98765 43210</span>
              </div>
              <div className="helpline-row">
                <span className="label">Accounts:</span>
                <span className="phone">+91 98765 43211</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
