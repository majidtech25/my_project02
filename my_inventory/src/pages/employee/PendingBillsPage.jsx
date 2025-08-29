import React, { useEffect, useState, useCallback } from "react";
import { getCreditSummary } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiCreditCard, FiDollarSign } from "react-icons/fi";

export default function PendingBillsPage() {
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ total: 0, amount: 0 });

  // ✅ Load pending bills
  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCreditSummary({ tab: "open" });
      const data = res.data || [];
      setBills(data);
      setStats({
        total: data.length,
        amount: data.reduce((sum, b) => sum + (b.amount || 0), 0),
      });
    } catch (err) {
      console.error("Error loading bills:", err);
      toast.error("Failed to load pending bills.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // ✅ Request clearance (mock)
  const requestClearance = (id) => {
    toast.info(`Clearance request sent for bill ${id} (awaiting manager approval).`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pending Bills</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI icon={FiCreditCard} label="Total Pending Bills" value={stats.total} />
        </Card>
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Total Amount (KES)"
            value={stats.amount.toLocaleString()}
          />
        </Card>
      </div>

      {/* Pending Bills Table */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Open Credit Bills</h2>
        <DataTable
          columns={[
            { key: "customer", label: "Customer" },
            { key: "amount", label: "Amount (KES)", sortable: true },
            { key: "date", label: "Date", sortable: true },
            { key: "staff", label: "Handled By" },
          ]}
          data={bills}
          loading={loading}
          rowActions={(row) => (
            <Button
              size="sm"
              variant="primary"
              onClick={() => requestClearance(row.id)}
            >
              Request Clearance
            </Button>
          )}
        />
      </Card>
    </div>
  );
}