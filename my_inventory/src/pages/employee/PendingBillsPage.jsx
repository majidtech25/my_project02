import React from "react";

const PendingBillsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Pending Bills</h1>
      <p className="text-gray-600">View all credit/unpaid sales assigned to you.</p>

      {/* Later:
          - Table of pending bills
          - Option to request manager approval for clearance
      */}
    </div>
  );
};

export default PendingBillsPage;