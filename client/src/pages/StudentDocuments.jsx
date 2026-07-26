import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiFileText, FiEdit3, FiExternalLink, FiCalendar } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const CATEGORY_META = {
  "STUDY MATERIAL": { icon: FiBookOpen, color: "#17a673", bg: "#e8f9f2" },
  PAPER: { icon: FiFileText, color: "#e5484d", bg: "#fdecec" },
  HOMEWORK: { icon: FiEdit3, color: "#b8860b", bg: "#fff8e6" },
};

const StudentDocuments = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: s } = await api.get(`/students/${id}`);
        setStudent(s);
        const { data: docs } = await api.get("/materials", {
          params: { class: s.class, section: s.section },
        });
        setMaterials(docs);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load documents" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="breadcrumb">Home / Students / Documents</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Student Documents</h1>
        <Link to={`/students/${id}`} className="btn btn-outline">
          <FiArrowLeft /> Back to Student
        </Link>
      </div>

      {loading || !student ? (
        <div className="loading-text">Loading documents...</div>
      ) : (
        <>
          <p className="small-muted" style={{ marginBottom: 16 }}>
            Showing study material, papers &amp; homework assigned to {student.name}'s class
            ({student.class || "Unassigned"} {student.section && `- ${student.section}`}).
          </p>

          {materials.length === 0 ? (
            <div className="card empty-state">
              <h3>No documents found for this student's class yet.</h3>
            </div>
          ) : (
            <div className="link-grid">
              {materials.map((m) => {
                const meta = CATEGORY_META[m.category] || CATEGORY_META["STUDY MATERIAL"];
                const Icon = meta.icon;
                return (
                  <div
                    className="link-card"
                    key={m._id}
                    style={{ borderTop: `3px solid ${meta.color}` }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="icon-wrap" style={{ background: meta.bg, color: meta.color }}>
                        <Icon />
                      </div>
                      <span className="badge" style={{ background: meta.bg, color: meta.color }}>
                        {m.category}
                      </span>
                    </div>
                    <h3>{m.title}</h3>
                    <p>{m.subject}</p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="small-muted"
                        style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}
                      >
                        <FiCalendar /> {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                      <a
                        href={m.link || "#!"}
                        target="_blank"
                        rel="noreferrer"
                        className="view-details"
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <FiExternalLink /> View Link
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDocuments;
