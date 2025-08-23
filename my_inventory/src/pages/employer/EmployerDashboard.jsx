import React from "react";
import KPI from "../../components/shared/KPI";
import ChartWrapper from "../../components/shared/ChartWrapper";
import Table from "../../components/shared/Table";
import AlertBox from "../../components/shared/AlertBox";
import { FiDollarSign, FiCreditCard, FiUsers } from "react-icons/fi";

const EmployerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI icon={FiDollarSign} label="Total Sales Today" value="$12,450" />
        <KPI icon={FiCreditCard} label="Pending Credits" value="$3,780" />
        <KPI icon={FiUsers} label="Active Employees" value="8" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartWrapper title="Daily Sales Trend" className="md:col-span-2" />
        <ChartWrapper title="Credit vs Paid Sales" />
      </div>

      {/* Alerts */}
      <AlertBox
        alerts={[
          "Low stock on Detergent A",
          "2 Unclosed Sales Days pending approval",
        ]}
      />

      {/* Transactions Table */}
      <Table
        title="Recent Transactions"
        columns={["Date", "Employee", "Payment Type", "Amount"]}
        data={[
          ["2025-08-20", "Alice", "Cash", "$200"],
          ["2025-08-19", "Bob", "Credit", "$150"],
          ["2025-08-18", "Charlie", "Card", "$320"],
        ]}
      />
    </div>
  );
};

export default EmployerDashboard;
