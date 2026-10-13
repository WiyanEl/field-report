
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Reports from './pages/Reports'
import CreateReport from './pages/CreateReport'
import Approvals from './pages/Approvals'
import DecisionHistory from './pages/DecisionHistory'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import type { UserRole } from "./types/auth";

function getDashboardPath(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin";
    case "reporter":
      return "/reports";
    case "approver":
      return "/approvals";
  }
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Memuat aplikasi...</div>;
  }

  return (
    <Navigate
      to={user ? getDashboardPath(user.role) : "/login"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Reports />
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminUsers />
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["reporter"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/reports"
            element={
              <Reports />
            }
          />
          <Route
            path="/reports/new"
            element={
              <CreateReport />
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["approver"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/approvals"
            element={
              <Approvals />
            }
          />
          <Route
            path="/approvals/history"
            element={
              <DecisionHistory />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}