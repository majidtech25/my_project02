// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { changePassword } from "../services/api";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await changePassword(newPassword); // ✅ no userId needed, backend uses token
      setMessage("✅ Password changed successfully.");
    } catch (err) {
      setMessage("❌ Failed to update password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        {message && <p className="mb-3 text-sm">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
