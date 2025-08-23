// src/pages/employee/EmployeeProfilePage.jsx
import { useState } from "react";

export default function EmployeeProfilePage() {
  const [name, setName] = useState("Employee Name");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function save(e) {
    e.preventDefault();
    alert("Saved (mock). Backend will persist this later.");
  }

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      <form className="grid gap-3" onSubmit={save}>
        <label className="grid text-sm">
          Full Name
          <input
            className="border rounded-xl px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="grid text-sm">
          Phone
          <input
            className="border rounded-xl px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="grid text-sm">
          Email
          <input
            className="border rounded-xl px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button className="px-3 py-2 rounded-2xl shadow bg-black text-white w-max">
          Save
        </button>
      </form>
      <p className="text-xs text-gray-600 mt-3">
        This is a placeholder UI. We’ll connect it to your API in Step 4 (wire
        frontend to real API).
      </p>
    </div>
  );
}
