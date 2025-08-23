// src/components/shared/KPI.jsx
import React from "react";

const KPI = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded shadow">
      {/* ✅ Render icon as component */}
      {Icon && <Icon className="text-blue-600 text-xl" />}

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </div>
  );
};

export default KPI;
