import React, { useEffect, useState } from "react";
import Card from "../../components/shared/Card";
import DataTable from "../../components/shared/DataTable";
import {
  getDayStatus,
  openSalesDay,
  closeSalesDay,
  getDayHistory,
} from "../../services/api";

export default function ManagerDayOpsPage() {
  const [dayStatus, setDayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const status = await getDayStatus();
    const hist = await getDayHistory();
    setDayStatus(status);
    setHistory(hist);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleOpenDay() {
    if (!window.confirm("Are you sure you want to open today’s sales?")) return;
    await openSalesDay();
    await refresh();
  }

  async function handleCloseDay() {
    if (!window.confirm("Are you sure you want to close today’s sales?")) return;
    await closeSalesDay();
    await refresh();
  }

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Day Control</h2>
            {dayStatus?.isOpen ? (
              <p className="text-green-600">
                Sales are OPEN for {dayStatus.date}
              </p>
            ) : (
              <p className="text-red-600">
                Sales are CLOSED. Open to start a new day.
              </p>
            )}
          </div>
          <div>
            {dayStatus?.isOpen ? (
              <button
                onClick={handleCloseDay}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Close Day
              </button>
            ) : (
              <button
                onClick={handleOpenDay}
                className="btn bg-blue-600 text-white hover:bg-blue-700"
              >
                Open Day
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Day History</h2>
        <DataTable
          loading={loading}
          columns={[
            "Date",
            "Status",
            "Sales",
            "Credit Open",
            "Credit Cleared",
            "Paid",
          ]}
          data={
            Array.isArray(history)
            ? history.map((d) => ({
              key: d.date, 
              values: [
                d.data,
                d.isOpen ? "open" : "closed",
                'ksh ${d.sales}',
                'Ksh ${d.credit0pen}',
                'Ksh ${d.creditCleared}',
                'Ksh ${d.paid}',
              ]
            }))
            :[]
          }
        />
      </Card>
    </div>
  );
}