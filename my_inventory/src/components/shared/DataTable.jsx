import React, { useState } from "react";

export default function DataTable({ title, columns, data, loading, pageSize = 5 }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, asc: true });

  if (loading) return <p className="p-4">Loading...</p>;

  const sorted = [...data].sort((a, b) => {
    if (!sort.key) return 0;
    const valA = a[sort.key];
    const valB = b[sort.key];
    if (valA < valB) return sort.asc ? -1 : 1;
    if (valA > valB) return sort.asc ? 1 : -1;
    return 0;
  });

  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="space-y-2">
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-3 py-2 cursor-pointer"
                onClick={() =>
                  setSort({ key: col.key, asc: sort.key === col.key ? !sort.asc : true })
                }
              >
                {col.label}
                {sort.key === col.key ? (sort.asc ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            paginated.map((row, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}