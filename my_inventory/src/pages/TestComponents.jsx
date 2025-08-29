// src/pages/TestComponents.jsx
import React from "react";
import Card from "../components/shared/Card";
import KPI from "../components/shared/KPI";
import ChartWrapper from "../components/shared/ChartWrapper";
import DataTable from "../components/shared/DataTable";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import AlertBox from "../components/shared/AlertBox";

// ✅ Import icons
import { FiDollarSign, FiCreditCard, FiUsers } from "react-icons/fi";

const TestComponents = () => {
  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "employee", label: "Employee", sortable: true },
    { key: "payment", label: "Payment", sortable: true },
  ];

  const data = [
    { date: "05/30/2024", employee: "Alice", payment: "$260" },
    { date: "05/29/2024", employee: "Bob", payment: "$540" },
    { date: "05/28/2024", employee: "Charlie", payment: "$310" },
  ];

  return (
    <div className="flex">
      {/* Sidebar for employer */}
      <Sidebar role="employer" />

      <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Top bar */}
        <Topbar user={{ name: "John Doe" }} role="Employer" />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* KPIs */}
          <Card>
            <KPI icon={FiDollarSign} label="Total Sales" value="$1500" />
          </Card>
          <Card>
            <KPI icon={FiCreditCard} label="Pending Credits" value="$4200" />
          </Card>
          <Card>
            <KPI icon={FiUsers} label="Active Employees" value="12" />
          </Card>

          {/* Chart placeholders */}
          <Card className="col-span-2">
            <ChartWrapper title="Sales Trend" />
          </Card>
          <Card>
            <ChartWrapper title="Credit vs Paid Sales" />
          </Card>

          {/* Alerts */}
          <Card className="col-span-3">
            <AlertBox
              alerts={["Low stock on Product X", "Unclosed Sales Day"]}
            />
          </Card>

          {/* DataTable instead of old Table */}
          <Card className="col-span-3">
            <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
            <DataTable columns={columns} data={data} loading={false} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestComponents;
