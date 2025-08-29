// src/pages/employer/EmployerSalesOverviewPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getSalesOverview, getReports } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import Button from "../../components/shared/Button";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiShoppingCart } from "react-icons/fi";

export default function EmployerSalesOverviewPage() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "" });

  // ✅ Load overview
  const loadOverview = useCallback(async () => {
    try {
      const res = await getSalesOverview();
      setOverview(res);
    } catch (err) {
      console.error("Error loading overview:", err);
      toast.error("Failed to load sales overview");
    }
  }, []);

  // ✅ Load reports (daily breakdown)
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReports(filters);
      setReports(res.byDay || []);
    } catch (err) {
      console.error("Error loading reports:", err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOverview();
    loadReports();
  }, [loadOverview, loadReports]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sales Overview</h1>

      {/* KPIs */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <KPI
              icon={FiDollarSign}
              label="Total Sales Today"
              value={`KES ${overview.today.sales.toLocaleString()}`}
            />
          </Card>
          <Card>
            <KPI
              icon={FiShoppingCart}
              label="Orders Today"
              value={overview.today.orders}
            />
          </Card>
          <Card>
            <KPI
              icon={FiCreditCard}
              label="Open Credit"
              value={`KES ${overview.today.credit.toLocaleString()}`}
            />
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="flex flex-wrap gap-4">
          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: e.target.value }))
            }
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <Button variant="primary" onClick={loadReports}>
            Apply
          </Button>
        </div>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Daily Breakdown</h2>
        <DataTable
          columns={[
            { key: "date", label: "Date", sortable: true },
            { key: "sales", label: "Sales (KES)", sortable: true },
            { key: "creditOpen", label: "Credit (Open)", sortable: true },
            { key: "creditCleared", label: "Credit (Cleared)", sortable: true },
          ]}
          data={reports}
          loading={loading}
        />
      </Card>

      {/* Top Products */}
      {overview && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <DataTable
            columns={[
              { key: "name", label: "Product" },
              { key: "sold", label: "Units Sold", sortable: true },
            ]}
            data={overview.topProducts}
          />
        </Card>
      )}
    </div>
  );
}
