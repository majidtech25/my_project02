// src/pages/manager/ManagerDashboard.jsx
import React from "react";

const ManagerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Suppliers</h2>
          <p className="text-2xl mt-2">8</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-2xl mt-2">120</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Pending Credits</h2>
          <p className="text-2xl mt-2">$2,500</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow h-64 flex items-center justify-center">
          Chart: Supplier Payments
        </div>
        <div className="bg-white p-6 rounded shadow h-64 flex items-center justify-center">
          Chart: Product Stock Levels
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-red-100 p-4 rounded">
        <p className="text-red-800">⚠ Some products are low on stock!</p>
      </div>
    </div>
  );
};

export default ManagerDashboard;
