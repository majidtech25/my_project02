// src/components/shared/Topbar.jsx
import React from "react";
import { FiUser } from "react-icons/fi";

export default function Topbar({ user, role, onProfileClick }) {
  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-3 border-b border-gray-200">
      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-800 capitalize">
        {role} Dashboard
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* User Info / Profile */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <FiUser />
          <span className="hidden md:inline text-sm">
            {user?.name || "User"} ({role})
          </span>
        </button>
      </div>
    </header>
  );
}
