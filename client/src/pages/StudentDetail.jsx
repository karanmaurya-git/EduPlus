import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiCalendar,
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiUser,
  FiArrowLeft,
  FiCamera,
} from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const MAX_PHOTO_MB = 3;

const CARDS = [
  {
    key: "attendance",
    icon: FiCalendar,
    title: "Attendance",
    desc: "View daily presence records, monthly summary, and percentage tracking.",
    bg: "var(--primary-light)",
    color: "var(--primary-dark)",
    path: (id) => `/students/${id}/report`,
  },
  {
    key: "fees",
    icon: FiCreditCard,
    title: "Fees",
    desc: "Track payment history, upcoming dues, and download receipts.",
    bg: "var(--green-bg)",
    color: "var(--green)",
    path: (id) => `/students/${id}/fees`,
  },
  {
    key: "results",
    icon: FiFileText,
    title: "Results",
    desc: "Examine examination scores, term reports, and academic progress charts.",
    bg: "var(--gold-bg)",
    color: "var(--gold)",
    path: (id) => `/students/${id}/report`,
  },
  {
    key: "documents",
    icon: FiFolder,
    title: "Documents",
    desc: "Access certificates, assignments, and submitted academic materials.",
    bg: "#fde7f3",
    color: "#d6336c",
    path: (id) => `/students/${id}/documents`,
  },
  {
    key: "profile",
    icon: FiUser,
    title: "Full Profile",
    desc: "Manage personal details, contact information, and institutional dossier.",
    bg: "#eef0f5",
    color: "var(--text-muted)",
    path: (id) => `/students/${id}/profile`,
  },
];

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .get(`/students/${id}`)
      .then(({ data }) => setStudent(data))
      .catch(() => setToast({ type: "error", message: "Failed to load student" }));
  }, [id]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Please choose an image file" });
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setToast({ type: "error", message: `Image must be smaller than ${MAX_PHOTO_MB}MB` });
      return;
    }

    setUploadingPhoto(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });

      const { data } = await api.put(`/students/${id}`, { profileImage: base64 });
      setStudent(data);
      setToast({ type: "success", message: "Student photo updated!" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Photo upload failed" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!student) return <div className="loading-text">Loading student...</div>;

  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <Link to="/students" className="btn btn-outline" style={{ marginBottom: 16 }}>
        <FiArrowLeft /> Back to Students
      </Link>

      <div
        className="card"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
              {student.profileImage ? (
                <img src={student.profileImage} alt={student.name} />
              ) : (
                initials
              )}
            </div>
            <label
              className={`photo-upload-btn${uploadingPhoto ? " uploading" : ""}`}
              style={{ width: 22, height: 22, fontSize: 10, bottom: -3, right: -3, borderWidth: 2 }}
              title="Upload student photo"
            >
              <FiCamera />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{student.name}</div>
            <div className="small-muted" style={{ margin: 0 }}>
              Roll No: {student.rollNo || "N/A"} &nbsp;•&nbsp; Class:{" "}
              {student.class && student.section
                ? `${student.class}-${student.section}`
                : "Unassigned"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="stat-inline">
            <div className="label">Academic Status</div>
          </div>
          <span className={`badge ${student.status === "Active" ? "badge-green" : "badge-gray"}`}>
            {student.status === "Active" ? "Active Enrollment" : student.status}
          </span>
        </div>
      </div>

      <div className="link-grid">
        {CARDS.map((c) => (
          <div className="link-card" key={c.key}>
            <div className="icon-wrap" style={{ background: c.bg, color: c.color }}>
              <c.icon />
            </div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <Link to={c.path(id)} className="view-details">
              View Details ›
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDetail;
