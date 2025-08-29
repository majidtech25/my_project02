// src/components/shared/KPI.jsx
import React from "react";

export default function KPI({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-semibold dark:text-white">{value}</p>
      </div>
    </div>
  );
}