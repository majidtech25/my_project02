import React, { useEffect, useState } from "react";
import Card from "../../components/shared/Card";
import DataTable from "../../components/shared/DataTable";
import {
  getDayStatus,
  openSalesDay,
  closeSalesDay,
  getDayHistory,
  getEmployees,
} from "../../services/api";

export default function ManagerDayOpsPage() {
  const [dayStatus, setDayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeLookup, setEmployeeLookup] = useState({});

  async function refresh() {
    setLoading(true);
    try {
      const status = await getDayStatus();
      const hist = await getDayHistory();
      setDayStatus(status);
      setHistory(Array.isArray(hist) ? hist : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getEmployees({ limit: 500 });
        const list = Array.isArray(res?.data) ? res.data : [];
        const lookup = {};
        list.forEach((emp) => {
          lookup[emp.id] = emp.name;
        });
        setEmployeeLookup(lookup);
      } catch (err) {
        console.error("Failed to load employees for day ops", err);
      }
    })();
  }, []);

  const resolveEmployeeName = (id) => {
    if (!id) return "—";
    return employeeLookup[id] || `Employee #${id}`;
  };

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
                Sales are OPEN for {dayStatus.date}. Opened by {resolveEmployeeName(dayStatus?.openedById)}.
              </p>
            ) : (
              <p className="text-red-600">
                Sales are CLOSED. Last opened by {resolveEmployeeName(dayStatus?.openedById)} and closed by {resolveEmployeeName(dayStatus?.closedById)}.
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
            { key: "date", label: "Date" },
            { key: "status", label: "Status" },
            { key: "opened_by", label: "Opened By" },
            { key: "closed_by", label: "Closed By" },
          ]}
          data={Array.isArray(history)
            ? history.map((day) => ({
                id: day.id,
                date: day.date ?? "—",
                status: day.is_open ? "Open" : "Closed",
                opened_by: resolveEmployeeName(day.opened_by_id),
                closed_by: resolveEmployeeName(day.closed_by_id),
              }))
            : []}
        />
      </Card>
    </div>
  );
}
