// src/pages/manager/ManagerEmployeesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
} from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import ModalCard from "../../components/shared/ModalCard";
import { toast } from "react-toastify";
import { FiUsers, FiUserCheck, FiUserX } from "react-icons/fi";

export default function ManagerEmployeesPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    status: "active",
  });

  // ✅ Fetch employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      const list = res.data || [];
      setEmployees(list);

      const activeCount = list.filter((e) => e.status === "active").length;
      setStats({
        total: res.total || list.length,
        active: activeCount,
        inactive: (res.total || list.length) - activeCount,
      });
    } catch (err) {
      console.error("Error loading employees:", err);
      toast.error("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Save employee
  const handleSave = async (e) => {
    e.preventDefault(); // ⬅️ Prevent page reload
    try {
      if (editing) {
        await updateEmployee(editing.id, form);
        toast.success("Employee updated!");
      } else {
        await createEmployee(form);
        toast.success("Employee added!");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", role: "", phone: "", status: "active" });
      loadEmployees();
    } catch (err) {
      console.error("Error saving employee:", err);
      toast.error("Failed to save employee.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employees (Manager)</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI icon={FiUsers} label="Total Employees" value={stats.total} />
        </Card>
        <Card>
          <KPI icon={FiUserCheck} label="Active Employees" value={stats.active} />
        </Card>
        <Card>
          <KPI icon={FiUserX} label="Inactive Employees" value={stats.inactive} />
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Employee List</h2>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Employee
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "role", label: "Role" },
            { key: "phone", label: "Phone" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
          ]}
          data={employees}
          loading={loading}
          rowActions={(row) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(row);
                setForm({
                  name: row.name,
                  role: row.role,
                  phone: row.phone,
                  status: row.status,
                });
                setShowForm(true);
              }}
            >
              Edit
            </Button>
          )}
        />
      </Card>

      {/* Modal Form */}
      {showForm && (
        <ModalCard
          title={editing ? "Edit Employee" : "Add Employee"}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Role</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </form>
        </ModalCard>
      )}
    </div>
  );
}