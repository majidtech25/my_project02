// src/components/shared/Card.jsx
import React from "react";

export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition hover:shadow-lg ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}