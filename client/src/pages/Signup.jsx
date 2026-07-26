import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiHash } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNo: "" });
  const [submitting, setSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({ ...form, role: "student" });
      navigate("/dashboard");
    } catch (err) {
      // handled by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-circle">E+</div>
        </div>
        <div className="login-heading">EduPlus</div>
        <div className="login-title">Create Student Account</div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Full Name</label>
            <div className="login-input">
              <FiUser />
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="login-field">
            <label>Roll Number</label>
            <div className="login-input">
              <FiHash />
              <input name="rollNo" value={form.rollNo} onChange={handleChange} required />
            </div>
          </div>

          <div className="login-field">
            <label>Email</label>
            <div className="login-input">
              <FiMail />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input">
              <FiLock />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign Up →"}
          </button>
        </form>

        <div className="login-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
