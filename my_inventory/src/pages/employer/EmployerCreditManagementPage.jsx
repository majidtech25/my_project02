// src/pages/employer/EmployerCreditManagementPage.jsx
import { useEffect, useState } from "react";
import { getCreditSummary, markCreditCleared } from "../../services/api";

export default function EmployerCreditManagementPage() {
  const [tab, setTab] = useState("open");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(""); // value we actually fetch with
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // bump to refetch after actions

  // Fetch whenever tab/appliedSearch changes or we bump refreshKey
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await getCreditSummary({ tab, search: appliedSearch });
      if (alive) {
        setRows(res?.data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, appliedSearch, refreshKey]);

  async function clearCredit(id) {
    // Real enforcement of rules will live on the backend.
    await markCreditCleared(id);
    // trigger a refetch without referencing a function in useEffect
    setRefreshKey((k) => k + 1);
  }

  function applyFilters() {
    // Only update the applied value so typing in the input doesn't refetch
    setAppliedSearch(search);
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border overflow-hidden">
          {[
            { k: "open", label: "Open Credits" },
            { k: "cleared", label: "Cleared" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-3 py-2 ${
                tab === t.k ? "bg-gray-900 text-white" : "bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <h1 className="text-xl font-semibold">Credit Management</h1>
        <div />
      </header>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer…"
          className="border rounded-xl px-3 py-2"
          aria-label="Search credits by customer"
        />
        <button onClick={applyFilters} className="px-3 py-2 rounded-xl border">
          Apply
        </button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Staff</th>
              {tab === "cleared" ? (
                <th className="text-left p-3">Cleared On</th>
              ) : null}
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={tab === "cleared" ? 6 : 5}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={tab === "cleared" ? 6 : 5}>
                  No results
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.customer}</td>
                  <td className="p-3 text-right">{r.amount}</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3">{r.staff}</td>
                  {tab === "cleared" ? (
                    <td className="p-3">{r.clearedOn}</td>
                  ) : null}
                  <td className="p-3 text-right">
                    {tab === "open" ? (
                      <button
                        className="px-2 py-1 rounded-lg border"
                        onClick={() => clearCredit(r.id)}
                      >
                        Mark Cleared
                      </button>
                    ) : (
                      <button className="px-2 py-1 rounded-lg border" disabled>
                        —
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600">
        Note: Real approval + day-close rules (Manager/Employer approvals, no
        clearing after day close, etc.) will be enforced by the backend. This
        page only mocks the flow.
      </p>
    </div>
  );
}
