// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import ProfileCard from "../components/shared/ProfileCard";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - filter menus based on role */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <Topbar
          user={user}
          role={user?.role}
          onProfileClick={() => setShowProfile(true)}
        />

        {/* Page Content */}
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
