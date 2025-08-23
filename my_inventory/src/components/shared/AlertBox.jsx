// src/components/shared/AlertBox.jsx
import React from "react";
import Card from "./Card";
import { FiAlertCircle } from "react-icons/fi";

const AlertBox = ({ alerts = [] }) => {
  // Ensure alerts is always an array
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  return (
    <Card>
      <h3 className="font-medium mb-2">Alerts</h3>
      <ul className="space-y-2">
        {safeAlerts.length > 0 ? (
          safeAlerts.map((alert, i) => (
            <li key={i} className="flex items-center text-sm text-red-600">
              <FiAlertCircle className="mr-2" /> {String(alert)}
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No alerts</p>
        )}
      </ul>
    </Card>
  );
};

export default AlertBox;
