import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("eduplus_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (identifier, password, loginType) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { identifier, password, loginType });
      localStorage.setItem("eduplus_token", data.token);
      localStorage.setItem("eduplus_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("eduplus_token", data.token);
      localStorage.setItem("eduplus_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("eduplus_token");
    localStorage.removeItem("eduplus_user");
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem("eduplus_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
