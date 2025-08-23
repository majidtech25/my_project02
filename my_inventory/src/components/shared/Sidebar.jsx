// src/components/shared/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import menuConfig from "../../config/menuConfig";

const Sidebar = ({ role = "employee" }) => {
  const items = menuConfig[role] || [];

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">IMS</h2>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end
                className={({ isActive }) =>
                  `flex items-center p-2 rounded transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                {Icon ? <Icon className="mr-3" /> : null}
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-blue-200/80 text-sm">No menu available</p>
      )}
    </aside>
  );
};

export default Sidebar;
