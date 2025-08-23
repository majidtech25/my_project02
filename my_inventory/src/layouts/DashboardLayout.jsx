// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import ProfileCard from "../components/shared/ProfileCard";

const DashboardLayout = ({ role }) => {
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (shared, reads src/config/menuConfig.js) */}
      <Sidebar role={role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <h1 className="text-lg font-semibold capitalize">{role} Dashboard</h1>

          <div className="relative">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {user?.name} ({user?.role})
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setShowProfile(true);
                    setDropdownOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Profile overlay */}
      {showProfile && <ProfileCard onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default DashboardLayout;
