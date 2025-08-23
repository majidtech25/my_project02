// src/components/shared/Table.jsx
import React from "react";
import Card from "./Card";

const Table = ({ title, columns = [], data = [] }) => {
  // Ensure both columns and data are arrays
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Card>
      <h3 className="font-medium mb-2">{title || "Table"}</h3>
      <table className="w-full text-sm text-left border">
        <thead className="bg-gray-100">
          <tr>
            {safeColumns.map((col, i) => (
              <th key={i} className="p-2 border-b">
                {String(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length > 0 ? (
            safeData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {Array.isArray(row) ? (
                  row.map((cell, j) => (
                    <td key={j} className="p-2 border-b">
                      {String(cell)}
                    </td>
                  ))
                ) : (
                  <td
                    colSpan={safeColumns.length}
                    className="p-2 border-b text-gray-500"
                  >
                    {String(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={safeColumns.length || 1}
                className="p-2 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
};

export default Table;
