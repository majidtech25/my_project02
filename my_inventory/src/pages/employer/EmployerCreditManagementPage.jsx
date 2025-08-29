// src/pages/employer/EmployerCreditManagementPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getCreditSummary, markCreditCleared } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiCreditCard } from "react-icons/fi";

export default function EmployerCreditManagementPage() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("open"); // open | cleared
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ open: 0, cleared: 0 });

  // ✅ Fetch credit summary
  const loadCredits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCreditSummary({ tab });
      setRows(res.data || []);

      if (tab === "open") {
        setStats((s) => ({ ...s, open: res.data.length }));
      } else {
        setStats((s) => ({ ...s, cleared: res.data.length }));
      }
    } catch (err) {
      console.error("Error loading credits:", err);
      toast.error("Failed to load credit records");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  // ✅ Clear a credit
  const handleClear = async (id) => {
    try {
      await markCreditCleared(id);
      toast.success("Credit cleared successfully");
      loadCredits(); // refresh
    } catch (err) {
      console.error("Error clearing credit:", err);
      toast.error("Failed to clear credit");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Credit Management</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Pending Credits"
            value={stats.open}
          />
        </Card>
        <Card>
          <KPI
            icon={FiCreditCard}
            label="Cleared Credits"
            value={stats.cleared}
          />
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex gap-4 mb-4">
          <Button
            variant={tab === "open" ? "primary" : "secondary"}
            onClick={() => setTab("open")}
          >
            Open Credits
          </Button>
          <Button
            variant={tab === "cleared" ? "primary" : "secondary"}
            onClick={() => setTab("cleared")}
          >
            Cleared Credits
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={[
            { key: "customer", label: "Customer", sortable: true },
            { key: "amount", label: "Amount (KES)", sortable: true },
            { key: "date", label: "Date", sortable: true },
            {
              key: "staff",
              label: "Handled By",
              sortable: true,
            },
          ]}
          data={rows}
          loading={loading}
          actions={
            tab === "open" && (
              <Button
                variant="primary"
                onClick={() =>
                  toast.info("Select a row to clear credit (demo only)")
                }
              >
                Clear Selected
              </Button>
            )
          }
          rowActions={
            tab === "open"
              ? (row) => (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleClear(row.id)}
                  >
                    Clear
                  </Button>
                )
              : undefined
          }
        />
      </Card>
    </div>
  );
}