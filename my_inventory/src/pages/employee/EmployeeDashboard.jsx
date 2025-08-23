// src/pages/employee/EmployeeDashboard.jsx
import React from "react";

const EmployeeDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">New Sale</h2>
          <p className="mt-2 text-blue-600 cursor-pointer">➕ Create</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Pending Bills</h2>
          <p className="mt-2 text-yellow-600">5</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Sales Today</h2>
          <p className="mt-2 text-green-600">$1,200</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded shadow h-64 flex items-center justify-center">
        Chart: My Sales Performance
      </div>

      {/* Notes / Alerts */}
      <div className="bg-blue-100 p-4 rounded">
        <p className="text-blue-800">
          ℹ Remember to close sales at end of day.
        </p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
