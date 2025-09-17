// src/pages/manager/ManagerCreditManagementPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getCreditSummary, markCreditCleared } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiCreditCard } from "react-icons/fi";

export default function ManagerCreditManagementPage() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("open"); // open | cleared
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ open: 0, cleared: 0 });

  // ✅ Load credits
  const loadCredits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCreditSummary({ tab });
      setRows(res?.data || []);

      if (tab === "open") {
        setStats((s) => ({ ...s, open: res?.data?.length || 0 }));
      } else {
        setStats((s) => ({ ...s, cleared: res?.data?.length || 0 }));
      }
    } catch (err) {
      console.error("Error loading credits:", err);
      toast.error("Failed to load credit records.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  // ✅ Clear a single credit
  const handleClear = async (id) => {
    try {
      await markCreditCleared(id);
      toast.success("Credit cleared successfully.");
      loadCredits();
    } catch (err) {
      console.error("Error clearing credit:", err);
      toast.error("Failed to clear credit.");
    }
  };

  // ✅ Bulk clear credits
  const handleBulkClear = async (ids) => {
    try {
      await Promise.all(ids.map((id) => markCreditCleared(id)));
      toast.success(`Cleared ${ids.length} credit(s)`);
      loadCredits();
    } catch (err) {
      console.error("Bulk clear error:", err);
      toast.error("Failed to clear selected credits");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Credit Management (Manager)</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI icon={FiCreditCard} label="Pending Credits" value={stats.open} />
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
            { key: "staff", label: "Handled By" },
            tab === "cleared" && { key: "clearedOn", label: "Cleared On" },
          ].filter(Boolean)}
          data={rows}
          loading={loading}
          actions={(selected) =>
            tab === "open" &&
            selected.length > 0 && (
              <Button
                variant="primary"
                onClick={() => handleBulkClear(selected)}
              >
                Clear Selected ({selected.length})
              </Button>
            )
          }
          rowActions={
            tab === "open"
              ? (row) => (
                  <Button
                    size="sm"
                    variant="secondary"
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
