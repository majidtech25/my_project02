// src/components/shared/DataTable.jsx
import React, { useState } from "react";

export default function DataTable({
  title,
  columns,
  data = [],
  loading,
  pageSize = 5,
  actions, // top-level actions (Clear Selected etc.)
  rowActions, // per-row action buttons
  onSelect, // callback for selected row IDs
  idKey = "id", // which key to use as row identifier
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, asc: true });
  const [selected, setSelected] = useState([]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading records...</div>
    );
  }

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

  // ✅ Selection handlers
  const toggleSelect = (id) => {
    const updated = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(updated);
    onSelect?.(updated);
  };

  const toggleSelectAll = () => {
    if (paginated.every((row) => selected.includes(row[idKey]))) {
      const updated = selected.filter(
        (id) => !paginated.some((row) => row[idKey] === id)
      );
      setSelected(updated);
      onSelect?.(updated);
    } else {
      const newIds = [
        ...new Set([...selected, ...paginated.map((row) => row[idKey])]),
      ];
      setSelected(newIds);
      onSelect?.(newIds);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      {title && <h2 className="text-lg font-semibold">{title}</h2>}

      {/* Global Actions */}
      {actions && <div className="mb-2">{actions(selected)}</div>}

      {/* Table */}
      <table className="min-w-full text-sm border rounded overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {/* Checkbox column */}
            <th className="px-3 py-2">
              <input
                type="checkbox"
                checked={
                  paginated.length > 0 &&
                  paginated.every((row) => selected.includes(row[idKey]))
                }
                onChange={toggleSelectAll}
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-3 py-2 cursor-pointer"
                onClick={() =>
                  setSort({
                    key: col.key,
                    asc: sort.key === col.key ? !sort.asc : true,
                  })
                }
              >
                {col.label}
                {sort.key === col.key ? (sort.asc ? " ▲" : " ▼") : ""}
              </th>
            ))}
            {rowActions && <th className="px-3 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 2 : 1)}
                className="p-6 text-center text-gray-500"
              >
                No records found
              </td>
            </tr>
          ) : (
            paginated.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(row[idKey])}
                    onChange={() => toggleSelect(row[idKey])}
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {rowActions && <td className="px-3 py-2">{rowActions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-2 text-sm">
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
