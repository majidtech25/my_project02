// src/pages/Unauthorized.jsx
import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
    <p className="mb-6">You don’t have permission to view this page.</p>
    <Link to="/" className="text-blue-500 underline">
      Go back
    </Link>
  </div>
);

export default Unauthorized;
