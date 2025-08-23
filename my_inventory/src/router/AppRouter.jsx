// src/router/AppRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Context
import { useAuth } from "../context/AuthContext";

// Layout
import DashboardLayout from "../layouts/DashboardLayout";

// Auth & Misc Pages
import Login from "../pages/Login";
import TestComponents from "../pages/TestComponents";

// EMPLOYER
import EmployerDashboard from "../pages/employer/EmployerDashboard";
import EmployerSalesOverviewPage from "../pages/employer/EmployerSalesOverviewPage";
import EmployerCreditManagementPage from "../pages/employer/EmployerCreditManagementPage";
import EmployerEmployeesPage from "../pages/employer/EmployerEmployeesPage";
import EmployerProductsPage from "../pages/employer/EmployerProductsPage";
import EmployerSuppliersPage from "../pages/employer/EmployerSuppliersPage";
import EmployerReportsPage from "../pages/employer/EmployerReportsPage";

// MANAGER
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerCreditManagementPage from "../pages/manager/ManagerCreditManagementPage";
import ManagerEmployeesPage from "../pages/manager/ManagerEmployeesPage";
import ManagerProductsPage from "../pages/manager/ManagerProductsPage";
import ManagerSuppliersPage from "../pages/manager/ManagerSuppliersPage";
import ManagerDayOpsPage from "../pages/manager/ManagerDayOpsPage";
import ManagerReportsPage from "../pages/manager/ManagerReportsPage";

// EMPLOYEE
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import NewSalePage from "../pages/employee/NewSalePage";
import PendingBillsPage from "../pages/employee/PendingBillsPage";
import SalesHistoryPage from "../pages/employee/SalesHistoryPage";

const AppRouter = () => {
  const { user } = useAuth();

  // Unauthenticated routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Optional: default landing redirect after login */}
      <Route
        path="/"
        element={<Navigate to={`/${user.role}/dashboard`} replace />}
      />

      {/* Employer Routes */}
      {user.role === "employer" && (
        <Route element={<DashboardLayout role="employer" />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route
            path="/employer/sales-overview"
            element={<EmployerSalesOverviewPage />}
          />
          <Route
            path="/employer/credit"
            element={<EmployerCreditManagementPage />}
          />
          <Route
            path="/employer/employees"
            element={<EmployerEmployeesPage />}
          />
          <Route path="/employer/products" element={<EmployerProductsPage />} />
          <Route
            path="/employer/suppliers"
            element={<EmployerSuppliersPage />}
          />
          <Route path="/employer/reports" element={<EmployerReportsPage />} />
        </Route>
      )}

      {/* Manager Routes */}
      {user.role === "manager" && (
        <Route element={<DashboardLayout role="manager" />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route
            path="/manager/credit"
            element={<ManagerCreditManagementPage />}
          />
          <Route path="/manager/employees" element={<ManagerEmployeesPage />} />
          <Route path="/manager/products" element={<ManagerProductsPage />} />
          <Route path="/manager/suppliers" element={<ManagerSuppliersPage />} />
          <Route path="/manager/day-ops" element={<ManagerDayOpsPage />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
        </Route>
      )}

      {/* Employee Routes */}
      {user.role === "employee" && (
        <Route element={<DashboardLayout role="employee" />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/new-sale" element={<NewSalePage />} />
          <Route
            path="/employee/pending-bills"
            element={<PendingBillsPage />}
          />
          <Route
            path="/employee/sales-history"
            element={<SalesHistoryPage />}
          />
        </Route>
      )}

      {/* Misc */}
      <Route path="/test" element={<TestComponents />} />

      {/* Catch all */}
      <Route
        path="*"
        element={<Navigate to={`/${user.role}/dashboard`} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
