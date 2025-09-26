// src/pages/employer/EmployerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getReports, getCreditsSummary, getEmployees } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import ChartWrapper from "../../components/shared/ChartWrapper";
import AlertBox from "../../components/shared/AlertBox";
import { toast } from "react-toastify";
import { FiDollarSign, FiUsers, FiCreditCard } from "react-icons/fi";

export default function EmployerDashboard() {
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    salesToday: 0,
    pendingCredits: 0,
    activeEmployees: 0,
  });

  // ✅ Load Dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [creditsRes, employeesRes, reportsRes] = await Promise.all([
        getCreditsSummary({ tab: "open" }),
        getEmployees(),
        getReports(),
      ]);

      const employeeList = Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : [];
      const activeEmployees = employeeList.filter(
        (e) => `${e.status}`.trim().toLowerCase() === "active"
      ).length;

      const salesSummary = reportsRes?.sales_summary || {};
      const creditSummary = reportsRes?.credit_summary || {};
      const pendingCredits = creditSummary.open_credits ?? creditsRes?.data?.length ?? 0;

      setStats({
        salesToday: salesSummary.total_sales || 0,
        pendingCredits,
        activeEmployees,
      });

      setRecentSales([]);

      const generatedAlerts = [];
      if ((creditSummary.open_credits || 0) > 0) {
        generatedAlerts.push("There are open credits awaiting clearance.");
      }
      setAlerts(generatedAlerts);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employer Dashboard</h1>

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
            value={stats.pendingCredits}
          />
        </Card>
        <Card>
          <KPI
            icon={FiUsers}
            label="Active Employees"
            value={stats.activeEmployees}
          />
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <ChartWrapper title="Sales Trend (Last 7 Days)" />
        </Card>
        <Card>
          <ChartWrapper title="Credit vs Paid Sales" />
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <h2 className="card-header">Alerts</h2>
        <AlertBox alerts={alerts} />
      </Card>

      {/* Recent Sales Table */}
      <Card>
        <h2 className="card-header">Recent Sales</h2>
        <DataTable
          columns={[
            { key: "date", label: "Date", sortable: true },
            { key: "employee", label: "Employee" },
            {
              key: "amount",
              label: "Amount (KES)",
              sortable: true,
              render: (row) => (
                <span className="font-semibold">
                  {row.amount.toLocaleString()}
                </span>
              ),
            },
          ]}
          data={recentSales}
          loading={loading}
          emptyMessage="No sales recorded today."
        />
      </Card>
    </div>
  );
}
