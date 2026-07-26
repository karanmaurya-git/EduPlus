import { useEffect, useState } from "react";
import { FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  teacherId: "",
  primarySubject: "",
  qualification: "",
  monthlySalary: "",
};

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff");
      setStaff(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load staff records" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.primarySubject || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ ...emptyForm, ...s, password: "" });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/staff/${editId}`, form);
        setToast({ type: "success", message: "Staff record updated!" });
      } else {
        await api.post("/staff", form);
        setToast({ type: "success", message: "Staff member added!" });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Save failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member permanently?")) return;
    try {
      await api.delete(`/staff/${id}`);
      setToast({ type: "success", message: "Staff member removed" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Staff Management</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiUserPlus /> Add Staff
        </button>
      </div>

      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div className="stat-inline">
            <div className="label">Total Active Faculty</div>
            <div className="value">{staff.length} Registered Staff</div>
          </div>
          <div className="field" style={{ minWidth: 280 }}>
            <div className="login-input" style={{ borderRadius: 10 }}>
              <FiSearch />
              <input
                placeholder="Search faculty by name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading staff records...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <h3>No staff records found</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff Name &amp; Email</th>
                <th>Employee ID</th>
                <th>Primary Subject</th>
                <th>Qualification</th>
                <th>Monthly Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="cell-name">{s.name}</div>
                    <div className="cell-sub">{s.email}</div>
                  </td>
                  <td>{s.teacherId || "—"}</td>
                  <td>{s.primarySubject || "—"}</td>
                  <td>{s.qualification || "—"}</td>
                  <td>₹{s.monthlySalary || 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-icon" onClick={() => openEdit(s)}>
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon absent" onClick={() => handleDelete(s._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
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
              <span>{editId ? "Edit Staff" : "Add Staff"}</span>
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
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Teacher ID</label>
                    <input name="teacherId" value={form.teacherId} onChange={handleChange} />
                  </div>
                </div>
                {!editId && (
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <div className="row-2">
                  <div className="field">
                    <label>Primary Subject</label>
                    <input
                      name="primarySubject"
                      value={form.primarySubject}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label>Qualification</label>
                    <input
                      name="qualification"
                      value={form.qualification}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Monthly Salary</label>
                  <input
                    type="number"
                    name="monthlySalary"
                    value={form.monthlySalary}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "Save Changes" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
