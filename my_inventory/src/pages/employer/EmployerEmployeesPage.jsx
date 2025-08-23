import { useEffect, useMemo, useState } from "react";
import { getEmployees, createEmployee, updateEmployee } from "../../services/api";

export default function EmployerEmployeesPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const title = useMemo(() => (editing ? "Edit Employee" : "Add Employee"), [editing]);

  async function refresh() {
    setLoading(true);
    const res = await getEmployees({ search: query });
    setRows(res.data);
    setTotal(res.total);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      role: form.get("role"),
      phone: form.get("phone"),
      status: form.get("status"),
    };
    if (editing) {
      await updateEmployee(editing.id, payload);
    } else {
      await createEmployee(payload);
    }
    setModalOpen(false);
    setEditing(null);
    await refresh();
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Employees</h1>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="px-3 py-2 rounded-2xl shadow bg-black text-white"
        >
          Add Employee
        </button>
      </header>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name..."
          className="input input-bordered w-full max-w-md border rounded-xl px-3 py-2"
          aria-label="Search employees by name"
        />
        <button onClick={refresh} className="px-3 py-2 rounded-xl border">
          Search
        </button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={5}>
                  No results
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.role}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">
                    <span
                      className={
                        "px-2 py-1 rounded-full text-xs " +
                        (r.status === "active" ? "bg-green-100" : "bg-gray-200")
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="px-2 py-1 rounded-lg border"
                      onClick={() => {
                        setEditing(r);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="px-2 py-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                name="name"
                defaultValue={editing?.name || ""}
                placeholder="Full name"
                className="border rounded-xl px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="phone"
                  defaultValue={editing?.phone || ""}
                  placeholder="Phone"
                  className="border rounded-xl px-3 py-2"
                  required
                />
                <select
                  name="role"
                  defaultValue={editing?.role || "Cashier"}
                  className="border rounded-xl px-3 py-2"
                >
                  <option>Cashier</option>
                  <option>Supervisor</option>
                </select>
              </div>
              <select
                name="status"
                defaultValue={editing?.status || "active"}
                className="border rounded-xl px-3 py-2"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  className="px-3 py-2 rounded-xl border"
                >
                  Cancel
                </button>
                <button className="px-3 py-2 rounded-2xl shadow bg-black text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="text-xs text-gray-500">Total: {total}</footer>
    </div>
  );
}