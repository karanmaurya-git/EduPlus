import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiBriefcase } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [loginType, setLoginType] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(identifier, password, loginType);
      navigate("/dashboard");
    } catch (err) {
      // error is already set in context
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
        <div className="login-title">Command Center Login</div>

        {error && <div className="error-banner">{error}</div>}

        <div className="role-toggle">
          <button
            type="button"
            className={loginType === "student" ? "active" : ""}
            onClick={() => setLoginType("student")}
          >
            <FiUser />
            STUDENT
          </button>
          <button
            type="button"
            className={loginType === "staff" ? "active" : ""}
            onClick={() => setLoginType("staff")}
          >
            <FiBriefcase />
            STAFF/ADMIN
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>{loginType === "student" ? "Roll Number / Email" : "Email"}</label>
            <div className="login-input">
              <FiMail />
              <input
                type="text"
                placeholder={loginType === "student" ? "Enter Roll No or Email" : "Enter Email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="forgot-link">
            <a href="#!">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login →"}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
