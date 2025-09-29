import React, { useEffect, useState, useCallback } from "react";
import {
  fetchSales,
  getCreditSummary,
} from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiFileText } from "react-icons/fi";

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

export default function ManagerReportsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    sales: 0,
    creditOpen: 0,
    creditCleared: 0,
  });
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "" });

  // ✅ Fetch reports
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.startDate = filters.from;
      if (filters.to) params.endDate = filters.to;

      const [salesRes, openCreditsRes, clearedCreditsRes] = await Promise.all([
        fetchSales({ ...params, limit: 1000 }),
        getCreditSummary({ tab: "open" }),
        getCreditSummary({ tab: "cleared" }),
      ]);

      const salesList = Array.isArray(salesRes) ? salesRes : [];
      const openCredits = Array.isArray(openCreditsRes?.data)
        ? openCreditsRes.data
        : [];
      const clearedCredits = Array.isArray(clearedCreditsRes?.data)
        ? clearedCreditsRes.data
        : [];

      const salesById = new Map(
        salesList.map((sale) => [sale.id, sale])
      );

      const salesTotal = salesList.reduce(
        (sum, sale) => sum + (sale.total_amount || 0),
        0
      );

      const openTotal = openCredits.reduce(
        (sum, credit) => sum + (credit.amount || 0),
        0
      );

      const clearedTotal = clearedCredits.reduce(
        (sum, credit) => sum + (credit.amount || 0),
        0
      );

      const dailyMap = new Map();

      const ensureEntry = (key) => {
        if (!dailyMap.has(key)) {
          dailyMap.set(key, {
            id: key,
            date: key,
            sales: 0,
            creditOpen: 0,
            creditCleared: 0,
          });
        }
        return dailyMap.get(key);
      };

      salesList.forEach((sale) => {
        const key = normalizeDateKey(sale.date);
        if (!key) return;
        const entry = ensureEntry(key);
        entry.sales += sale.total_amount || 0;
        if (sale.is_credit) {
          entry.creditOpen += sale.total_amount || 0;
        }
      });

      clearedCredits.forEach((credit) => {
        const sale = salesById.get(credit.sale_id);
        const key = normalizeDateKey(sale?.date || credit.date);
        if (!key) return;
        const entry = ensureEntry(key);
        entry.creditCleared += credit.amount || 0;
      });

      setStats({
        sales: salesTotal,
        creditOpen: openTotal,
        creditCleared: clearedTotal,
      });

      const sortedRows = Array.from(dailyMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRows(sortedRows);
    } catch (err) {
      console.error("Error loading reports:", err);
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ✅ Handle filters
  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Export
  const handleExport = (type) => {
    toast.info(`Exporting Manager Report as ${type} (mock only)`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manager Reports</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Total Sales (KES)"
            value={formatCurrency(stats.sales)}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Open Credit (KES)"
            value={formatCurrency(stats.creditOpen)}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Cleared Credit (KES)"
            value={formatCurrency(stats.creditCleared)}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm block mb-1">From</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleChange}
              className="border rounded px-3 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">To</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleChange}
              className="border rounded px-3 py-1 text-sm"
            />
          </div>
          <Button variant="primary" onClick={loadReports}>
            Apply
          </Button>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Daily Breakdown</h2>
        <DataTable
          columns={[
            { key: "date", label: "Date", sortable: true },
            {
              key: "sales",
              label: "Sales (KES)",
              sortable: true,
              render: (row) => formatCurrency(row.sales),
            },
            {
              key: "creditOpen",
              label: "Open Credit",
              sortable: true,
              render: (row) => formatCurrency(row.creditOpen),
            },
            {
              key: "creditCleared",
              label: "Cleared Credit",
              sortable: true,
              render: (row) => formatCurrency(row.creditCleared),
            },
          ]}
          data={rows}
          loading={loading}
          actions={
            <>
              <Button variant="secondary" onClick={() => handleExport("CSV")}>
                Export CSV
              </Button>
              <Button variant="secondary" onClick={() => handleExport("PDF")}>
                Export PDF
              </Button>
            </>
          }
        />
      </Card>
    </div>
  );
}
