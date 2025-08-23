import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ role, onProfileClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3 relative">
      <h1 className="text-lg font-semibold">{role} Dashboard</h1>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="text-gray-600"
        >
          {user?.name || "John Doe"}
        </button>

        {dropdownOpen && (
          <div className="absolute right-6 top-12 bg-white border shadow rounded w-40">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onProfileClick();
              }}
              className="block px-4 py-2 w-full text-left hover:bg-gray-100"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="block px-4 py-2 w-full text-left hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;