// src/pages/Login.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="bg-white p-6 rounded shadow-md w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <p className="mb-6 text-gray-600">Choose a role to simulate login</p>

        <div className="space-y-3">
          <button
            onClick={() => login("employer")}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Login as Employer
          </button>
          <button
            onClick={() => login("manager")}
            className="w-full bg-green-500 text-white py-2 rounded"
          >
            Login as Manager
          </button>
          <button
            onClick={() => login("employee")}
            className="w-full bg-purple-500 text-white py-2 rounded"
          >
            Login as Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
