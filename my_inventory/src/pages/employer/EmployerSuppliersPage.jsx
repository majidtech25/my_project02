// src/pages/employer/EmployerSuppliersPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getSuppliers } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiTruck, FiDollarSign } from "react-icons/fi";

export default function EmployerSuppliersPage() {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({ total: 0, outstanding: 0 });

  // ✅ Load suppliers
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Suppliers & Payments (Employer)
      </h1>

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
        <h2 className="text-lg font-semibold mb-4">Suppliers</h2>
        <DataTable
          columns={[
            { key: "name", label: "Supplier Name", sortable: true },
            { key: "contact", label: "Contact" },
            { key: "email", label: "Email" },
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
          rowActions={null} // 🚫 Employer cannot edit
        />
      </Card>
    </div>
  );
}
