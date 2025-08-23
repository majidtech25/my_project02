import React, { useMemo, useState } from "react";

const initialRows = [
  {
    id: "EMP-001",
    name: "Alice Kamau",
    role: "employee",
    username: "alice",
    phone: "0712 000 111",
    status: "Active",
  },
  {
    id: "EMP-002",
    name: "Bob Otieno",
    role: "employee",
    username: "bob",
    phone: "0722 111 222",
    status: "Active",
  },
  {
    id: "EMP-003",
    name: "Carol Njeri",
    role: "employee",
    username: "carol",
    phone: "0733 222 333",
    status: "Inactive",
  },
];

const emptyForm = {
  id: "",
  name: "",
  username: "",
  phone: "",
  role: "employee",
  status: "Active",
};

const ManagerEmployeesPage = () => {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editIndex, setEditIndex] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (idx) => {
    setForm(rows[idx]);
    setEditIndex(idx);
    setShowModal(true);
  };

  const removeRow = (idx) => {
    const next = [...rows];
    next.splice(idx, 1);
    setRows(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // simple required checks
    if (!form.name || !form.username) return;

    if (editIndex === null) {
      // Create: generate simple ID
      const nextId = `EMP-${String(rows.length + 1).padStart(3, "0")}`;
      setRows([{ ...form, id: nextId }, ...rows]);
    } else {
      // Update
      const next = [...rows];
      next[editIndex] = form;
      setRows(next);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditIndex(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Employees</h1>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, username, phone…"
            className="px-3 py-2 border rounded-md text-sm"
          />
          <button
            onClick={openCreate}
            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.username}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2 capitalize">{r.role}</td>
                  <td className="p-2">
                    <span
                      className={
                        r.status === "Active"
                          ? "text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs"
                          : "text-gray-700 bg-gray-200 px-2 py-0.5 rounded text-xs"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => openEdit(idx)}
                      className="px-2 py-1 text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeRow(idx)}
                      className="ml-3 px-2 py-1 text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editIndex === null ? "Add Employee" : "Edit Employee"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Username</label>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="07xx xxx xxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded border text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  {editIndex === null ? "Create" : "Save"}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-3">
              * This is UI-only for now — backend wiring (Flask) will replace
              the local state with real API calls.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerEmployeesPage;
