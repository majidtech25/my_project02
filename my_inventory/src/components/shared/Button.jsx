// src/components/shared/Button.jsx
import React from "react";

export default function Button({ children, className = "", onClick, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition
        ${disabled ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}
        ${className}`}
    >
      {children}
    </button>
  );
}