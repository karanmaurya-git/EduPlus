import { useEffect, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [category, setCategory] = useState("All Notice Categories");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "General", audience: "EVERYONE" });
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notices", { params: { category } });
      setNotices(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load notices" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/notices", form);
      setToast({ type: "success", message: "Announcement posted!" });
      setShowModal(false);
      setForm({ title: "", content: "", category: "General", audience: "EVERYONE" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Failed to post announcement" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Institutional Notice Board</h1>
        {(user?.role === "admin" || user?.role === "teacher") && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Post Announcement
          </button>
        )}
      </div>

      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div className="field">
            <label>Filter Announcements</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All Notice Categories</option>
              <option>General</option>
              <option>Exam</option>
              <option>Event</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="stat-inline">
            <div className="label">Total</div>
            <div className="value">Announcements: {notices.length}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="card empty-state">
          <h3>No announcements yet</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Announcement Content</th>
                <th>Published By</th>
                <th>Audience</th>
                <th>Posted On</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n, i) => (
                <tr key={n._id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="cell-name">{n.title}</div>
                    <div className="cell-sub">{n.content}</div>
                  </td>
                  <td>
                    <div className="cell-name">{n.publishedBy?.name || "System"}</div>
                    <div className="cell-sub">{(n.publishedBy?.role || "management").toUpperCase()}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{n.audience}</span>
                  </td>
                  <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <span>Post Announcement</span>
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
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Content</label>
                  <textarea
                    name="content"
                    rows={4}
                    value={form.content}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      <option>General</option>
                      <option>Exam</option>
                      <option>Event</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Audience</label>
                    <select name="audience" value={form.audience} onChange={handleChange}>
                      <option>EVERYONE</option>
                      <option>STUDENT</option>
                      <option>TEACHER</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
