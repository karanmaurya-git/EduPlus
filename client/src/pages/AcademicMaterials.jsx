import { useEffect, useState } from "react";
import { FiBookOpen, FiFileText, FiEdit3, FiExternalLink, FiPlus, FiX, FiCalendar } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const CATEGORY_META = {
  "STUDY MATERIAL": { icon: FiBookOpen, color: "#17a673", bg: "#e8f9f2" },
  PAPER: { icon: FiFileText, color: "#e5484d", bg: "#fdecec" },
  HOMEWORK: { icon: FiEdit3, color: "#b8860b", bg: "#fff8e6" },
};

const AcademicMaterials = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ class: "", section: "All Sections", category: "", subject: "" });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    targetClass: "",
    section: "All Sections",
    category: "STUDY MATERIAL",
    subject: "",
    link: "",
  });
  const [toast, setToast] = useState(null);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/materials", { params: filters });
      setMaterials(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to fetch resources" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/materials", form);
      setToast({ type: "success", message: "Resource uploaded successfully!" });
      setShowModal(false);
      load();
    } catch (err) {
      setToast({ type: "error", message: "Upload failed" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Assignments &amp; Papers</h1>
        {(user?.role === "admin" || user?.role === "teacher") && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Upload Resource
          </button>
        )}
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="field">
            <label>Target Class</label>
            <select name="class" value={filters.class} onChange={handleFilterChange}>
              <option value="">Select Class...</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={`${i + 1}`}>{`Class ${i + 1}`}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Section</label>
            <select name="section" value={filters.section} onChange={handleFilterChange}>
              <option>All Sections</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>
          <div className="field">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">Choose Category...</option>
              <option>STUDY MATERIAL</option>
              <option>PAPER</option>
              <option>HOMEWORK</option>
            </select>
          </div>
          <div className="field">
            <label>Subject</label>
            <input name="subject" value={filters.subject} onChange={handleFilterChange} placeholder="Mathematics" />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? "Fetching..." : "Load Ledger"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Fetching resources...</div>
      ) : materials.length === 0 ? (
        <div className="card empty-state">
          <h3>No resources found.</h3>
          <p>Try adjusting the filters above or upload a new resource.</p>
        </div>
      ) : (
        <div className="link-grid">
          {materials.map((m) => {
            const meta = CATEGORY_META[m.category] || CATEGORY_META["STUDY MATERIAL"];
            const Icon = meta.icon;
            return (
              <div className="link-card" key={m._id} style={{ borderTop: `3px solid ${meta.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="icon-wrap" style={{ background: meta.bg, color: meta.color }}>
                    <Icon />
                  </div>
                  <span className="badge" style={{ background: meta.bg, color: meta.color }}>
                    {m.category}
                  </span>
                </div>
                <h3>{m.title}</h3>
                <p>
                  {m.subject} • Class {m.targetClass}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="small-muted" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
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

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <span>Upload Resource</span>
              <button
                className="btn-icon"
                style={{ marginLeft: "auto" }}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-fields">
                <div className="field">
                  <label>Title</label>
                  <input name="title" value={form.title} onChange={handleFormChange} required />
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Target Class</label>
                    <input
                      name="targetClass"
                      value={form.targetClass}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Section</label>
                    <input name="section" value={form.section} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleFormChange}>
                      <option>STUDY MATERIAL</option>
                      <option>PAPER</option>
                      <option>HOMEWORK</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Subject</label>
                    <input name="subject" value={form.subject} onChange={handleFormChange} required />
                  </div>
                </div>
                <div className="field">
                  <label>Resource Link (URL)</label>
                  <input name="link" value={form.link} onChange={handleFormChange} placeholder="https://..." />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicMaterials;
