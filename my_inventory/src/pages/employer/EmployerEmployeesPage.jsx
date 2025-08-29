// src/pages/employer/EmployerEmployeesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getEmployees, createEmployee, updateEmployee } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiUsers, FiUserCheck, FiUserX } from "react-icons/fi";

export default function EmployerEmployeesPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", phone: "" });

  // ✅ Fetch employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      setEmployees(res.data || []);
      const activeCount = res.data.filter((e) => e.status === "active").length;
      setStats({
        total: res.total || 0,
        active: activeCount,
        inactive: res.total - activeCount,
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

  // ✅ Handle form input
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Save employee
  const handleSave = async () => {
    try {
      if (editing) {
        await updateEmployee(editing.id, form);
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(form);
        toast.success("Employee added successfully!");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", role: "", phone: "" });
      loadEmployees();
    } catch (err) {
      console.error("Error saving employee:", err);
      toast.error("Failed to save employee.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Employees</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI icon={FiUsers} label="Total Employees" value={stats.total} />
        </Card>
        <Card>
          <KPI icon={FiUserCheck} label="Active" value={stats.active} />
        </Card>
        <Card>
          <KPI icon={FiUserX} label="Inactive" value={stats.inactive} />
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Employees</h2>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Employee
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "role", label: "Role" },
            { key: "phone", label: "Phone" },
            { key: "status", label: "Status" },
          ]}
          data={employees}
          loading={loading}
          rowActions={(row) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(row);
                setForm({ name: row.name, role: row.role, phone: row.phone });
                setShowForm(true);
              }}
            >
              Edit
            </Button>
          )}
        />
      </Card>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">
              {editing ? "Edit Employee" : "Add Employee"}
            </h2>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Role"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}