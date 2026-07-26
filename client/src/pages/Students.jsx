import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUserPlus,
  FiSearch,
  FiUsers,
  FiEye,
  FiMoreVertical,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  rollNo: "",
  class: "",
  section: "",
  bloodGroup: "",
  guardianContact: "",
};

const emptyGuardianForm = {
  fatherName: "",
  motherName: "",
  guardianContact: "",
};

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [guardianId, setGuardianId] = useState(null);
  const [guardianForm, setGuardianForm] = useState(emptyGuardianForm);

  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load students" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo || "").toLowerCase().includes(search.toLowerCase())
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
        await api.put(`/students/${editId}`, form);
        setToast({ type: "success", message: "Student updated successfully!" });
      } else {
        await api.post("/students", form);
        setToast({ type: "success", message: "Student added successfully!" });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Save failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this student permanently?")) return;
    try {
      await api.delete(`/students/${id}`);
      setToast({ type: "success", message: "Student removed" });
      load();
    } catch (err) {
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  const openGuardian = (s) => {
    setGuardianId(s._id);
    setGuardianForm({
      fatherName: s.fatherName || "",
      motherName: s.motherName || "",
      guardianContact: s.guardianContact || "",
    });
    setShowGuardianModal(true);
  };

  const handleGuardianChange = (e) =>
    setGuardianForm({ ...guardianForm, [e.target.name]: e.target.value });

  const handleGuardianSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/students/${guardianId}`, guardianForm);
      setToast({ type: "success", message: "Guardian details updated!" });
      setShowGuardianModal(false);
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Update failed" });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Student Management</h1>
        {user?.role === "admin" && (
          <button className="btn btn-primary" onClick={openAdd}>
            <FiUserPlus /> Add Student
          </button>
        )}
      </div>

      <div className="card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <div className="stat-inline">
            <div className="label">Total Strength</div>
            <div className="value">{students.length} Registered Students</div>
          </div>
          <div className="field" style={{ minWidth: 280 }}>
            <div className="login-input" style={{ borderRadius: 10 }}>
              <FiSearch />
              <input
                placeholder="Search by name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-text">Loading students...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">
            <FiUsers />
          </div>
          <h3>No students found</h3>
          <p>Try adding a new student or adjusting your search.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student Name &amp; ID</th>
                <th>Roll No.</th>
                <th>Class &amp; Section</th>
                <th>Blood Grp</th>
                <th>Guardian Contact</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="cell-name">{s.name}</div>
                    <div className="cell-sub">{s.email}</div>
                  </td>
                  <td>{s.rollNo || "—"}</td>
                  <td>{s.class && s.section ? `${s.class} - ${s.section}` : "Unassigned"}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.bloodGroup && s.bloodGroup !== "N/A" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {s.bloodGroup || "N/A"}
                    </span>
                  </td>
                  <td>{s.guardianContact || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/students/${s._id}`} className="btn-icon" title="View Profile">
                        <FiEye />
                      </Link>
                      <button
                        className="btn-icon present"
                        onClick={() => openGuardian(s)}
                        title="Manage Guardian"
                      >
                        <FiUserPlus />
                      </button>
                      <button className="btn-icon" onClick={() => openEdit(s)} title="Edit / Manage">
                        <FiMoreVertical />
                      </button>
                      {user?.role === "admin" && (
                        <button
                          className="btn-icon absent"
                          onClick={() => handleDelete(s._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      )}
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
              <span>{editId ? "Edit Student" : "Add Student"}</span>
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
                    <label>Roll No.</label>
                    <input name="rollNo" value={form.rollNo} onChange={handleChange} />
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
                    <label>Class</label>
                    <input name="class" value={form.class} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Section</label>
                    <input name="section" value={form.section} onChange={handleChange} />
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label>Blood Group</label>
                    <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Guardian Contact</label>
                    <input
                      name="guardianContact"
                      value={form.guardianContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "Save Changes" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGuardianModal && (
        <div className="modal-backdrop" onClick={() => setShowGuardianModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <span>Manage Guardian Details</span>
              <button
                className="btn-icon"
                style={{ marginLeft: "auto" }}
                onClick={() => setShowGuardianModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleGuardianSubmit}>
              <div className="modal-fields">
                <div className="field">
                  <label>Father's Name</label>
                  <input
                    name="fatherName"
                    value={guardianForm.fatherName}
                    onChange={handleGuardianChange}
                  />
                </div>
                <div className="field">
                  <label>Mother's Name</label>
                  <input
                    name="motherName"
                    value={guardianForm.motherName}
                    onChange={handleGuardianChange}
                  />
                </div>
                <div className="field">
                  <label>Guardian Contact Number</label>
                  <input
                    name="guardianContact"
                    value={guardianForm.guardianContact}
                    onChange={handleGuardianChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowGuardianModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Guardian Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
