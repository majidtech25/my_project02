import React, { useEffect, useState, useCallback } from "react";
import { getSuppliers, createSupplier, updateSupplier } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiTruck, FiDollarSign } from "react-icons/fi";

export default function EmployerSuppliersPage() {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({ total: 0, outstanding: 0 });

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", contact: "", balance: "" });

  // ✅ Fetch suppliers
  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      const data = res.data || [];
      setSuppliers(data);
      setStats({
        total: data.length,
        outstanding: data.reduce((sum, s) => sum + (s.balance || 0), 0),
      });
    } catch (err) {
      console.error("Error loading suppliers:", err);
      toast.error("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Save supplier
  const handleSave = async () => {
    try {
      if (editing) {
        await updateSupplier(editing.id, form);
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplier(form);
        toast.success("Supplier added successfully!");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", contact: "", balance: "" });
      loadSuppliers();
    } catch (err) {
      console.error("Error saving supplier:", err);
      toast.error("Failed to save supplier.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Suppliers & Payments</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI icon={FiTruck} label="Total Suppliers" value={stats.total} />
        </Card>
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Outstanding Balance (KES)"
            value={stats.outstanding.toLocaleString()}
          />
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Suppliers</h2>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Supplier
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Supplier Name", sortable: true },
            { key: "contact", label: "Contact" },
            {
              key: "balance",
              label: "Outstanding (KES)",
              sortable: true,
              render: (row) => (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.balance > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {row.balance}
                </span>
              ),
            },
          ]}
          data={suppliers}
          loading={loading}
          rowActions={(row) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(row);
                setForm({
                  name: row.name,
                  contact: row.contact,
                  balance: row.balance,
                });
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
              {editing ? "Edit Supplier" : "Add Supplier"}
            </h2>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Supplier Name"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Contact Info"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              name="balance"
              value={form.balance}
              onChange={handleChange}
              placeholder="Outstanding Balance"
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