// src/pages/employee/EmployeeDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getReports, getCreditSummary } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import Button from "../../components/shared/Button";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiTrendingUp } from "react-icons/fi";

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    salesToday: 0,
    pendingCredits: 0,
  });
  const [recent, setRecent] = useState([]);

  // ✅ Load employee dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, creditsRes] = await Promise.all([
        getReports(),
        getCreditSummary({ tab: "open" }),
      ]);

      const salesSummary = reportsRes?.sales_summary || {};
      const dayReport = reportsRes?.day_report;

      setStats({
        salesToday: salesSummary.total_sales || 0,
        pendingCredits: creditsRes?.data?.length || 0,
      });

      const tableRows = [];
      if (dayReport) {
        tableRows.push({
          id: dayReport.date,
          date: dayReport.date,
          sales: salesSummary.total_sales || 0,
          creditOpen: salesSummary.total_credits || 0,
          creditCleared: salesSummary.total_cash || 0,
        });
      }

      setRecent(tableRows);
    } catch (err) {
      console.error("Error loading employee dashboard:", err);
      toast.error("Failed to load employee dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ✅ Table columns
  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "sales", label: "Sales (KES)", sortable: true },
    { key: "creditOpen", label: "Open Credit", sortable: true },
    { key: "creditCleared", label: "Cleared Credit", sortable: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employee Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Sales Today"
            value={`KES ${stats.salesToday.toLocaleString()}`}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Pending Credits"
            value={stats.pendingCredits}
          />
        </Card>
      </div>

      {/* Recent Sales */}
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
