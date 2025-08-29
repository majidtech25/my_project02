import React, { useEffect, useState, useCallback } from "react";
import { getReports } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiCheckCircle } from "react-icons/fi";

export default function SalesHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    credit: 0,
    cleared: 0,
  });

  const [filters, setFilters] = useState({ from: "", to: "" });

  // ✅ Load sales history
  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReports(filters);
      const data = res.byDay || [];

      const totalSales = data.reduce((sum, d) => sum + (d.sales || 0), 0);
      const creditOpen = data.reduce((sum, d) => sum + (d.creditOpen || 0), 0);
      const creditCleared = data.reduce((sum, d) => sum + (d.creditCleared || 0), 0);

      setStats({
        total: totalSales,
        credit: creditOpen,
        cleared: creditCleared,
      });

      setSales(data);
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

  // ✅ Handle filters
  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Request clearance (mock only, real approval is Manager/Employer)
  const requestClearance = (id) => {
    toast.info(`Clearance request sent for sale ${id} (awaiting approval).`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">My Sales History</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Total Sales (KES)"
            value={stats.total.toLocaleString()}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Credit Sales (KES)"
            value={stats.credit.toLocaleString()}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCheckCircle}
            label="Cleared Credits (KES)"
            value={stats.cleared.toLocaleString()}
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
          <Button variant="primary" onClick={loadSales}>
            Apply
          </Button>
        </div>
      </Card>

      {/* Sales Table */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Sales Records</h2>
        <DataTable
          columns={[
            { key: "date", label: "Date", sortable: true },
            { key: "sales", label: "Sales (KES)", sortable: true },
            { key: "creditOpen", label: "Credit (Open)", sortable: true },
            { key: "creditCleared", label: "Credit (Cleared)", sortable: true },
          ]}
          data={sales}
          loading={loading}
          rowActions={(row) =>
            row.creditOpen > 0 ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => requestClearance(row.date)}
              >
                Request Clearance
              </Button>
            ) : undefined
          }
        />
      </Card>
    </div>
  );
}