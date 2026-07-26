import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FiShield, FiFileText, FiEdit2, FiSave, FiCamera, FiArrowLeft } from "react-icons/fi";
import api from "../api/axios";
import Toast from "../components/Toast";

const MAX_PHOTO_MB = 3;

const StudentProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    const { data } = await api.get(`/students/${id}`);
    setProfile(data);
    setForm(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const { data } = await api.put(`/students/${id}`, form);
      setProfile(data);
      setEditing(false);
      setToast({ type: "success", message: "Student profile updated successfully!" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Update failed" });
    }
  };

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
      setProfile(data);
      setForm((f) => ({ ...f, profileImage: data.profileImage }));
      setToast({ type: "success", message: "Student photo updated!" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Photo upload failed" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!profile) return <div className="loading-text">Loading profile...</div>;

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to={`/students/${id}`} className="btn btn-outline">
            <FiArrowLeft /> Back
          </Link>
          <h1 className="page-title" style={{ margin: 0 }}>
            Student Profile Management
          </h1>
        </div>
        {!editing ? (
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSave}>
            <FiSave /> Save Changes
          </button>
        )}
      </div>

      <div className="profile-grid">
        <div>
          <div className="card profile-photo-card">
            <div className="profile-photo-wrap">
              <div className="profile-photo">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} />
                ) : (
                  initials
                )}
              </div>
              <label
                className={`photo-upload-btn${uploadingPhoto ? " uploading" : ""}`}
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
            <div className="profile-name">{profile.name}</div>
            <div className="profile-id">STUDENT ID: {profile.rollNo || "N/A"}</div>
          </div>

          <div className="info-block">
            <div className="info-block-header purple">
              <FiFileText /> INSTITUTIONAL STANDING
            </div>
            <div className="standing-list">
              <div className="standing-item">
                <div className="label">Class / Section</div>
                <div className="value">
                  {profile.class} — {profile.section || "N/A"}
                </div>
              </div>
              <div className="standing-item">
                <div className="label">Academic Session</div>
                <div className="value">{profile.academicSession}</div>
              </div>
              <div className="standing-item">
                <div className="label">Enrollment No.</div>
                <div className="value">{profile.enrollmentNo || "N/A"}</div>
              </div>
              <div className="standing-item">
                <div className="label">Current Status</div>
                <div className="value" style={{ color: "var(--green)" }}>
                  {profile.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="info-block">
            <div className="info-block-header">
              <FiShield /> OFFICIAL INSTITUTIONAL RECORDS
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="label">Institutional Email</div>
                {editing ? (
                  <input
                    className="remark-input"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="value">{profile.email}</div>
                )}
              </div>
              <div className="info-item">
                <div className="label">Contact Number</div>
                {editing ? (
                  <input
                    className="remark-input"
                    name="contactNumber"
                    value={form.contactNumber || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="value">{profile.contactNumber}</div>
                )}
              </div>
              <div className="info-item">
                <div className="label">Registration / Joining</div>
                <div className="value">{profile.createdAt?.slice(0, 10) || "N/A"}</div>
              </div>
              <div className="info-item">
                <div className="label">Access Protocol</div>
                <div className="value">{profile.accessProtocol}</div>
              </div>
            </div>
          </div>

          <div className="info-block">
            <div className="info-block-header">
              <FiFileText /> PERSONAL DETAIL LEDGER
            </div>
            <div className="info-grid">
              {[
                ["fatherName", "Father Name"],
                ["motherName", "Mother Name"],
                ["dob", "Date of Birth"],
                ["religion", "Religion"],
                ["gender", "Gender"],
                ["bloodGroup", "Blood Group"],
                ["guardianContact", "Guardian Contact"],
                ["aadharNo", "Aadhar No."],
                ["panCardNo", "PAN Card No."],
              ].map(([key, label]) => (
                <div className="info-item" key={key}>
                  <div className="label">{label}</div>
                  {editing ? (
                    <input
                      className="remark-input"
                      name={key}
                      value={form[key] || ""}
                      onChange={handleChange}
                    />
                  ) : key === "bloodGroup" ? (
                    <span
                      className={`badge ${
                        profile.bloodGroup && profile.bloodGroup !== "N/A"
                          ? "badge-green"
                          : "badge-red"
                      }`}
                    >
                      {profile.bloodGroup || "N/A"}
                    </span>
                  ) : (
                    <div className="value">{profile[key] || "—"}</div>
                  )}
                </div>
              ))}
              <div className="info-item" style={{ gridColumn: "1 / -1" }}>
                <div className="label">Current Address</div>
                {editing ? (
                  <input
                    className="remark-input"
                    name="currentAddress"
                    value={form.currentAddress || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="value">{profile.currentAddress || "—"}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
