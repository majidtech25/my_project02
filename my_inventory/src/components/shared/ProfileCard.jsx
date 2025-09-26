import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiX, FiUser } from "react-icons/fi";

export default function ProfileCard({ onClose }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  // Local form state
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      password: "",
    });
  }, [user, editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // ⚡ Step 4: Send update request to backend
    console.log("Profile updated:", form);
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 text-blue-600 rounded-full p-3">
            <FiUser size={24} />
          </div>
          <h2 className="text-lg font-semibold">
            {editing ? "Edit Profile" : "My Profile"}
          </h2>
        </div>

        {/* Content */}
        {!editing ? (
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Name:</span>
              <span>{user?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Role:</span>
              <span className="capitalize">{user?.role || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Phone:</span>
              <span>{user?.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span className="capitalize">{user?.status || "N/A"}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded-xl px-3 py-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border rounded-xl px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border rounded-xl px-3 py-2 w-full"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Footer buttons */}
        {!editing && (
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
