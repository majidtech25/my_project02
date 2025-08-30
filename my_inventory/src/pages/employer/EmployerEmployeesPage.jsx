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

export default function EmployerEmployeesPage() {
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

  // ✅ Load employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      setEmployees(res.data || []);
      const activeCount = res.data.filter((e) => e.status === "active").length;
      setStats({
        total: res.total || res.data.length,
        active: activeCount,
        inactive: (res.total || res.data.length) - activeCount,
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

  // ✅ Save employee (Employer also allowed)
  const handleSave = async () => {
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
      <h1 className="text-2xl font-semibold">Employees (Employer)</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI icon={FiUsers} label="Total Employees" value={stats.total} />
        </Card>
        <Card>
          <KPI
            icon={FiUserCheck}
            label="Active Employees"
            value={stats.active}
          />
        </Card>
        <Card>
          <KPI
            icon={FiUserX}
            label="Inactive Employees"
            value={stats.inactive}
          />
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

      {/* Add/Edit Modal (Pop Card style) */}
      {showForm && (
        <ModalCard
          title={editing ? "Edit Employee" : "Add Employee"}
          onClose={() => setShowForm(false)}
        >
          <div className="space-y-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Role"
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full border rounded px-3 py-2"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </ModalCard>
      )}
    </div>
  );
}
