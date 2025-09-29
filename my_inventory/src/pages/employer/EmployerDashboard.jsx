// src/pages/employer/EmployerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  fetchSales,
  getCreditsSummary,
  getEmployees,
} from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import ChartWrapper from "../../components/shared/ChartWrapper";
import AlertBox from "../../components/shared/AlertBox";
import Button from "../../components/shared/Button";
import { toast } from "react-toastify";
import { FiDollarSign, FiUsers, FiCreditCard } from "react-icons/fi";

function formatCurrency(value) {
  return "KES " + Number(value || 0).toLocaleString();
}

function formatDate(value) {
  if (!value) return "—";
  if (typeof value === "string" && value.length <= 10) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return (
    parsed.toLocaleDateString() +
    " " +
    parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export default function EmployerDashboard() {
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    salesToday: 0,
    pendingCreditCount: 0,
    pendingCreditAmount: 0,
    activeEmployees: 0,
  });
  const [employeeLookup, setEmployeeLookup] = useState({});

  const todayKey = new Date().toISOString().slice(0, 10);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [creditsRes, employeesRes, todaySales, recentSalesRes] =
        await Promise.all([
          getCreditsSummary({ tab: "open" }),
          getEmployees(),
          fetchSales({ startDate: todayKey, endDate: todayKey, limit: 500 }),
          fetchSales({ limit: 100 }),
        ]);

      const employeeList = Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : [];
      const activeEmployees = employeeList.filter(
        (emp) => String(emp.status || "").trim().toLowerCase() === "active"
      ).length;
      const lookup = {};
      employeeList.forEach((emp) => {
        lookup[emp.id] = emp.name || `Employee #${emp.id}`;
      });
      setEmployeeLookup(lookup);

      const creditList = Array.isArray(creditsRes?.data)
        ? creditsRes.data
        : [];
      const pendingCreditAmount = creditList.reduce(
        (sum, credit) => sum + (credit.amount || 0),
        0
      );

      const salesToday = todaySales.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      );

      const recentRows = recentSalesRes
        .map((sale) => ({
          id: sale.id,
          date: sale.date,
          employee: sale.employee_id
            ? lookup[sale.employee_id] || `Employee #${sale.employee_id}`
            : "—",
          amount: sale.total_amount || 0,
          payment: sale.payment_method || (sale.is_credit ? "Credit" : "—"),
          status: sale.is_credit
            ? "Credit (pending)"
            : sale.is_paid
            ? "Paid"
            : "Unpaid",
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 25);

      setStats({
        salesToday,
        pendingCreditCount: creditList.length,
        pendingCreditAmount,
        activeEmployees,
      });
      setRecentSales(recentRows);

      const generatedAlerts = [];
      if (creditList.length > 0) {
        generatedAlerts.push("There are open credits awaiting clearance.");
      }
      setAlerts(generatedAlerts);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handler = (event) => {
      const key = event instanceof StorageEvent ? event.key : event.type;
      if (key === "ims:sale:created") {
        loadDashboard();
      }
    };
    window.addEventListener("ims:sale:created", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ims:sale:created", handler);
      window.removeEventListener("storage", handler);
    };
  }, [loadDashboard]);

  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    { key: "employee", label: "Employee", sortable: true },
    {
      key: "amount",
      label: "Amount (KES)",
      sortable: true,
      render: (row) => formatCurrency(row.amount),
    },
    { key: "payment", label: "Payment" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Total Sales Today"
            value={formatCurrency(stats.salesToday)}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Pending Credits"
            value={
              stats.pendingCreditCount +
              " (" + formatCurrency(stats.pendingCreditAmount) + ")"
            }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <ChartWrapper title="Sales Trend (Last 7 Days)" />
        </Card>
        <Card>
          <ChartWrapper title="Credit vs Paid Sales" />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-header">Alerts</h2>
          <Button variant="primary" onClick={loadDashboard} disabled={loading}>
            Refresh
          </Button>
        </div>
        <AlertBox alerts={alerts} />
      </Card>

      <Card>
        <h2 className="card-header">Recent Sales</h2>
        <DataTable
          columns={columns}
          data={recentSales}
          loading={loading}
          emptyMessage="No sales recorded yet."
        />
      </Card>
    </div>
  );
}
