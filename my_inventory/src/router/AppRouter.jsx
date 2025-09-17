// src/router/AppRouter.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import jwtDecode from "jwt-decode";

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
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Employer Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/sales-overview"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerSalesOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/credit"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerCreditManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/employees"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerEmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/products"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/suppliers"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerSuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/reports"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/credit"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerCreditManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/day-ops"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDayOpsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/employees"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerEmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/products"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/suppliers"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerSuppliersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/new-sale"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <NewSalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/pending-bills"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <PendingBillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/sales-history"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <SalesHistoryPage />
            </ProtectedRoute>
          }
        />
        {/*Reset Password*/}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
