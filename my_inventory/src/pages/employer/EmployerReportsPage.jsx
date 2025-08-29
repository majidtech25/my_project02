import React, { useEffect, useState, useCallback } from "react";
import { getReports } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiDollarSign, FiCreditCard, FiFileText } from "react-icons/fi";

export default function EmployerReportsPage() {
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
      const res = await getReports(filters);
      setStats(res.totals || {});
      setRows(res.byDay || []);
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

  // ✅ Export placeholders
  const handleExport = (type) => {
    toast.info(`Exporting report as ${type} (mock only)`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Total Sales (KES)"
            value={stats.sales?.toLocaleString() || 0}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Open Credit (KES)"
            value={stats.creditOpen?.toLocaleString() || 0}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Cleared Credit (KES)"
            value={stats.creditCleared?.toLocaleString() || 0}
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
            { key: "sales", label: "Sales (KES)", sortable: true },
            { key: "creditOpen", label: "Open Credit", sortable: true },
            { key: "creditCleared", label: "Cleared Credit", sortable: true },
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