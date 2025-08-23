// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // login with role
  const login = (role) => {
    const newUser = { name: "John Doe", role };
    setUser(newUser);

    // Redirect to correct dashboard
    navigate(`/${role}/dashboard`);
  };

  // logout
  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
