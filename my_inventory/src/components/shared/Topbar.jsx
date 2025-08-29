// src/components/shared/Topbar.jsx
import React from "react";
import { FiMoon, FiSun, FiUser } from "react-icons/fi";
import useDarkMode from "../../hooks/useDarkMode";

export default function Topbar({ user, role, onProfileClick }) {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 shadow px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 capitalize">
        {role} Dashboard
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
          <span className="hidden md:inline text-sm">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>

        {/* User Info / Profile */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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