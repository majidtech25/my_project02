import React, { useEffect, useState, useCallback } from "react";
import { getMySales } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import Button from "../../components/shared/Button";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiFileText, FiRefreshCcw } from "react-icons/fi";
import { resolvePaymentLabel } from "../../config/paymentMethods";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString() + " " + parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SalesHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.startDate = filters.from;
      if (filters.to) params.endDate = filters.to;
      const res = await getMySales(params);
      setSales(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading sales history:", err);
      toast.error("Failed to load sales history.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const paidSales = sales
    .filter((sale) => sale.is_paid && !sale.is_credit)
    .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const outstandingCredits = sales
    .filter((sale) => sale.is_credit)
    .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

  const tableData = sales.map((sale) => {
    const itemsCount = sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const status = sale.is_credit ? "credit" : sale.is_paid ? "paid" : "pending";
    return {
      id: sale.id,
      date: sale.date,
      total_amount: sale.total_amount,
      status,
      payment_method: sale.payment_method,
      itemsCount,
      raw: sale,
    };
  });

  const columns = [
    { key: "id", label: "Sale #", sortable: true },
    {
      key: "date",
      label: "Date/Time",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: "total_amount",
      label: "Total (KES)",
      sortable: true,
      render: (row) => formatCurrency(row.total_amount),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        if (row.status === "credit") return "Credit (pending)";
        if (row.status === "paid") return "Paid";
        return "Pending";
      },
    },
    {
      key: "payment_method",
      label: "Payment",
      render: (row) => {
        if (row.status === "credit") return "Awaiting payment";
        if (!row.payment_method) return "N/A";
        return resolvePaymentLabel(row.payment_method);
      },
    },
    {
      key: "itemsCount",
      label: "Items",
      sortable: true,
      render: (row) => row.itemsCount + " items",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">My Sales History</h1>
        <Button onClick={loadSales} className="flex items-center gap-2">
          <FiRefreshCcw /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI icon={FiDollarSign} label="Total Sales (KES)" value={formatCurrency(totalSales)} />
        </Card>
        <Card>
          <KPI icon={FiDollarSign} label="Paid Sales" value={formatCurrency(paidSales)} />
        </Card>
        <Card>
          <KPI icon={FiCreditCard} label="Outstanding Credit" value={formatCurrency(outstandingCredits)} />
        </Card>
      </div>

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
          <Button onClick={loadSales} className="flex items-center gap-2">
            <FiFileText /> Apply
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-2">Sales Records</h2>
        <DataTable columns={columns} data={tableData} loading={loading} />
      </Card>
    </div>
  );
}
