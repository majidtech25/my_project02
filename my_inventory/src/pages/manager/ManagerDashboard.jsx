// src/pages/manager/ManagerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getReports, getCreditSummary, getSuppliers } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiTruck } from "react-icons/fi";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    salesToday: 0,
    credits: 0,
    suppliers: 0,
  });
  const [recent, setRecent] = useState([]);

  // ✅ Load dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, creditsRes, suppliersRes] = await Promise.all([
        getReports(),
        getCreditSummary({ tab: "open" }),
        getSuppliers(),
      ]);

      const summary = reportsRes?.sales_summary || {};
      const creditSummary = reportsRes?.credit_summary || {};

      const supplierList = Array.isArray(suppliersRes?.data)
        ? suppliersRes.data
        : [];

      setStats({
        salesToday: summary.total_sales || 0,
        credits: creditsRes?.data?.length || 0,
        suppliers: supplierList.length,
      });

      const recentRows = [];
      if (reportsRes?.day_report) {
        recentRows.push({
          id: reportsRes.day_report.date,
          date: reportsRes.day_report.date,
          sales: summary.total_sales || 0,
          creditOpen: creditSummary.open_credits || 0,
          creditCleared: creditSummary.cleared_credits || 0,
        });
      }

      setRecent(recentRows);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error("Failed to load manager dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ✅ Table config
  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "sales", label: "Sales (KES)", sortable: true },
    { key: "creditOpen", label: "Open Credit", sortable: true },
    { key: "creditCleared", label: "Cleared Credit", sortable: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manager Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Total Sales Today"
            value={`KES ${stats.salesToday.toLocaleString()}`}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Pending Credits"
            value={stats.credits}
          />
        </Card>
        <Card>
          <KPI
            icon={FiTruck}
            label="Suppliers"
            value={stats.suppliers}
          />
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Recent Sales (Last 5 Days)</h2>
        <DataTable
          columns={columns}
          data={recent}
          loading={loading}
          actions={
            <Button variant="primary" onClick={loadDashboard}>
              Refresh
            </Button>
          }
        />
      </Card>
    </div>
  );
}
