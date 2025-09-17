// src/components/shared/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import menuConfig from "../../config/menuConfig";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || "guest"; // fallback in case no user
  const menuItems = menuConfig?.[role] || [];

  return (
    <aside className="flex flex-col w-64 bg-gradient-to-b from-blue-900 to-blue-700 text-white min-h-screen">
      {/* Logo */}
      <div className="p-4 text-lg font-bold border-b border-blue-600">IMS</div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive ? "bg-blue-600" : "hover:bg-blue-500"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-600">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-600 bg-red-500 transition-colors w-full"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
