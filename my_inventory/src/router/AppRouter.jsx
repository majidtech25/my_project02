// src/router/AppRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

import DashboardLayout from "../layouts/DashboardLayout";

// ===== Pages =====
import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";

// Employer Pages
import EmployerDashboard from "../pages/employer/EmployerDashboard";
import EmployerCreditManagementPage from "../pages/employer/EmployerCreditManagementPage";
import EmployerEmployeesPage from "../pages/employer/EmployerEmployeesPage";
import EmployerProductsPage from "../pages/employer/EmployerProductsPage";
import EmployerReportsPage from "../pages/employer/EmployerReportsPage";
import EmployerSalesOverviewPage from "../pages/employer/EmployerSalesOverviewPage";
import EmployerSuppliersPage from "../pages/employer/EmployerSuppliersPage";

// Manager Pages
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerCreditManagementPage from "../pages/manager/ManagerCreditManagementPage";
import ManagerDayOpsPage from "../pages/manager/ManagerDayOpsPage";
import ManagerEmployeesPage from "../pages/manager/ManagerEmployeesPage";
import ManagerProductsPage from "../pages/manager/ManagerProductsPage"; // ✅ fixed spelling
import ManagerReportsPage from "../pages/manager/ManagerReportsPage";
import ManagerSuppliersPage from "../pages/manager/ManagerSuppliersPage";

// Employee Pages
import EmployeeDashboard from "../pages/employee/EmployeeDashboard"; // ✅ fixed spelling
import EmployeeProfilePage from "../pages/employee/EmployeeProfilePage";
import NewSalesPage from "../pages/employee/NewSalePage";
import PendingBillsPage from "../pages/employee/PendingBillsPage";
import SalesHistoryPage from "../pages/employee/SalesHistoryPage";

// ===== Token Helpers =====
function getRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch {
    return null;
  }
}

// ===== ProtectedRoute =====
function ProtectedRoute({ children, allowedRoles }) {
  const role = getRoleFromToken();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ===== Main Router =====
export default function AppRouter() {
  return (
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Employer Routes */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="sales-overview" element={<EmployerSalesOverviewPage />} />
          <Route path="credit" element={<EmployerCreditManagementPage />} />
          <Route path="employees" element={<EmployerEmployeesPage />} />
          <Route path="products" element={<EmployerProductsPage />} />
          <Route path="suppliers" element={<EmployerSuppliersPage />} />
          <Route path="reports" element={<EmployerReportsPage />} />
        </Route>

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="credit" element={<ManagerCreditManagementPage />} />
          <Route path="day-ops" element={<ManagerDayOpsPage />} />
          <Route path="employees" element={<ManagerEmployeesPage />} />
          <Route path="products" element={<ManagerProductsPage />} />
          <Route path="suppliers" element={<ManagerSuppliersPage />} />
          <Route path="reports" element={<ManagerReportsPage />} />
        </Route>

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
          <Route path="new-sale" element={<NewSalesPage />} />
          <Route path="pending-bills" element={<PendingBillsPage />} />
          <Route path="sales-history" element={<SalesHistoryPage />} />
        </Route>
        {/*Reset Password*/}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}
