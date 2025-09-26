// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi } from "../services/api";
import  jwtDecode  from "jwt-decode"; // ✅ correct import for v4

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // fall through to token decode
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          id: decoded.sub,
          role: decoded.role,
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  // ===== Login =====
  const login = async (username, password) => {
    try {
      const data = await loginApi(username, password); // ✅ now username instead of phone
      if (data?.access_token) {
        const decoded = jwtDecode(data.access_token);
        const profile = data.user || {};
        const loggedUser = {
          id: decoded.sub,
          role: profile.role || decoded.role,
          name: profile.name || username,
          phone: profile.phone || "",
          status: profile.status,
        };

        setUser(loggedUser);
        localStorage.setItem("user", JSON.stringify(loggedUser));

        // Redirect to dashboard based on role
        navigate(`/${loggedUser.role}/dashboard`);
      }
    } catch (err) {
      throw new Error(err.message || "Login failed");
    }
  };

  // ===== Logout =====
  const logout = () => {
    logoutApi();
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Correct export
export const useAuth = () => useContext(AuthContext);
