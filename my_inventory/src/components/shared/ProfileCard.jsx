// src/components/ProfileCard.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const ProfileCard = ({ onClose }) => {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-bold mb-4">Profile</h2>

        <div className="space-y-3">
          <p><strong>Name:</strong> {user?.name || "N/A"}</p>
          <p><strong>Email:</strong> {user?.email || "N/A"}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;