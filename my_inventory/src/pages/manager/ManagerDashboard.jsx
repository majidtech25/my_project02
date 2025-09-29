// src/pages/manager/ManagerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  fetchSales,
  getCreditSummary,
  getSuppliers,
  getEmployees,
} from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiTruck } from "react-icons/fi";

function formatCurrency(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "—";
  if (typeof value === "string" && value.length <= 10) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString() + " " + parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    salesToday: 0,
    creditCount: 0,
    creditAmount: 0,
    suppliers: 0,
  });
  const [recent, setRecent] = useState([]);
  const [employeeLookup, setEmployeeLookup] = useState({});

  const todayKey = new Date().toISOString().slice(0, 10);

  // ✅ Load dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [todaySales, recentSales, creditsRes, suppliersRes, employeesRes] =
        await Promise.all([
          fetchSales({ startDate: todayKey, endDate: todayKey, limit: 500 }),
          fetchSales({ limit: 50 }),
          getCreditSummary({ tab: "open" }),
          getSuppliers(),
          getEmployees({ limit: 500 }),
        ]);

      const supplierList = Array.isArray(suppliersRes?.data)
        ? suppliersRes.data
        : [];

      const employeeList = Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : [];
      const lookup = {};
      employeeList.forEach((emp) => {
        lookup[emp.id] = emp.name || `Employee #${emp.id}`;
      });
      setEmployeeLookup(lookup);

      const salesToday = todaySales.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      );

      const creditList = Array.isArray(creditsRes?.data)
        ? creditsRes.data
        : [];
      const creditAmount = creditList.reduce(
        (sum, credit) => sum + (credit.amount || 0),
        0
      );

      const resolveEmployeeName = (id) => {
        if (!id) return "—";
        return lookup[id] || `Employee #${id}`;
      };

      const recentRows = recentSales
        .map((sale) => ({
          id: sale.id,
          date: sale.date,
          employee: resolveEmployeeName(sale.employee_id),
          total: sale.total_amount,
          payment: sale.payment_method || (sale.is_credit ? "Credit" : "—"),
          status: sale.is_credit
            ? "Credit (pending)"
            : sale.is_paid
            ? "Paid"
            : "Unpaid",
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20);

      setStats({
        salesToday,
        creditCount: creditList.length,
        creditAmount,
        suppliers: supplierList.length,
      });
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

  // ✅ Table config
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    { key: "employee", label: "Handled By", sortable: true },
    {
      key: "total",
      label: "Amount (KES)",
      sortable: true,
      render: (row) => formatCurrency(row.total),
    },
    { key: "payment", label: "Payment" },
    { key: "status", label: "Status" },
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
            value={formatCurrency(stats.salesToday)}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Pending Credits"
            value={`${stats.creditCount} (${formatCurrency(stats.creditAmount)})`}
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Recent Sales</h2>
          <Button variant="primary" onClick={loadDashboard} disabled={loading}>
            Refresh
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={recent}
          loading={loading}
        />
      </Card>
    </div>
  );
}
