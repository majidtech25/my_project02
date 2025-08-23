import { useEffect, useState } from "react";
import { getReports } from "../../services/api";

export default function EmployerReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const res = await getReports({ from, to });
    setReport(res);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-xl border"
            onClick={() => alert("Export CSV (mock)")}
          >
            Export CSV
          </button>
          <button
            className="px-3 py-2 rounded-xl border"
            onClick={() => alert("Export PDF (mock)")}
          >
            Export PDF
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="grid text-sm">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
        </label>
        <label className="grid text-sm">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
        </label>
        <button onClick={refresh} className="px-3 py-2 rounded-xl border">
          Apply
        </button>
      </div>

      <section className="grid gap-3">
        {loading ? (
          <div>Loading…</div>
        ) : report ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Total Sales" value={report.totals.sales} />
              <Stat label="Open Credit" value={report.totals.creditOpen} />
              <Stat
                label="Cleared Credit"
                value={report.totals.creditCleared}
              />
            </div>
            <div className="overflow-x-auto border rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Sales</th>
                    <th className="text-right p-3">Credit (Open)</th>
                    <th className="text-right p-3">Credit (Cleared)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byDay.map((d) => (
                    <tr key={d.date} className="border-t">
                      <td className="p-3">{d.date}</td>
                      <td className="p-3 text-right">{d.sales}</td>
                      <td className="p-3 text-right">{d.creditOpen}</td>
                      <td className="p-3 text-right">{d.creditCleared}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>No data</div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
