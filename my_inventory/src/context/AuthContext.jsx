// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi } from "../services/api";
import { jwtDecode } from "jwt-decode"; // ✅ correct import for v4

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    // Restore user from localStorage if token exists
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
  const login = async (phone, password) => {
    try {
      const data = await loginApi(phone, password);
      if (data?.access_token) {
        const decoded = jwtDecode(data.access_token);
        const loggedUser = {
          id: decoded.sub,
          role: decoded.role,
        };
        setUser(loggedUser);

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
