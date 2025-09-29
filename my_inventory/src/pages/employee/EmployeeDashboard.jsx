// src/pages/employee/EmployeeDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getMySales } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard } from "react-icons/fi";
import Button from "../../components/shared/Button";
import { useAuth } from "../../context/AuthContext";

function formatCurrency(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function normalizeDateKey(value) {
  if (!value) return null;
  if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    salesToday: 0,
    pendingCreditCount: 0,
    pendingCreditAmount: 0,
  });
  const [recent, setRecent] = useState([]);

  const todayKey = new Date().toISOString().slice(0, 10);

  // ✅ Load employee dashboard data
  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [todaySales, allSales] = await Promise.all([
        getMySales({ startDate: todayKey, endDate: todayKey }),
        getMySales(),
      ]);

      const combinedSales = Array.isArray(allSales) ? allSales : [];
      const todayList = combinedSales.filter(
        (sale) => normalizeDateKey(sale.date) === todayKey
      );
      const fallbackToday = Array.isArray(todaySales) ? todaySales : [];
      const effectiveToday = todayList.length > 0 ? todayList : fallbackToday;

      const todayTotal = effectiveToday.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      );

      const pendingCredits = combinedSales.filter((sale) => sale.is_credit);
      const pendingCreditCount = pendingCredits.length;
      const pendingCreditAmount = pendingCredits.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      );

      const recentRows = [...combinedSales]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map((sale) => ({
          id: sale.id,
          date: sale.date,
          total: sale.total_amount,
          status: sale.is_credit
            ? "Credit (pending)"
            : sale.is_paid
            ? "Paid"
            : "Unpaid",
          payment: sale.payment_method || (sale.is_credit ? "Credit" : "—"),
        }));

      setStats({
        salesToday: todayTotal,
        pendingCreditCount,
        pendingCreditAmount,
      });
      setRecent(recentRows);
    } catch (err) {
      console.error("Error loading employee dashboard:", err);
      toast.error("Failed to load employee dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, todayKey]);

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

  // ✅ Table columns
  const columns = [
    { key: "date", label: "Date", sortable: true },
    {
      key: "total",
      label: "Amount (KES)",
      sortable: true,
      render: (row) => formatCurrency(row.total),
    },
    { key: "payment", label: "Payment Method" },
    { key: "status", label: "Status" },
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
            value={formatCurrency(stats.salesToday)}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Pending Credits"
            value={`${stats.pendingCreditCount} (${formatCurrency(
              stats.pendingCreditAmount
            )})`}
          />
        </Card>
      </div>

      {/* Recent Sales */}
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
