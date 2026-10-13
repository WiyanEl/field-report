
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/auth";
import "./DashboardLayout.css";

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

const menus: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: "▦" },
    { label: "Data Laporan", path: "/admin/reports", icon: "▤" },
    { label: "Kelola Pengguna", path: "/admin/users", icon: "♙" },
  ],
  reporter: [
    { label: "Laporan Saya", path: "/reports", icon: "▤" },
    { label: "Buat Laporan", path: "/reports/new", icon: "+" },
  ],
  approver: [
    { label: "Persetujuan", path: "/approvals", icon: "✓" },
    {
      label: "Riwayat Keputusan",
      path: "/approvals/history",
      icon: "◷",
    },
  ],
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  reporter: "Pelapor",
  approver: "Approver",
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const userMenus = menus[user.role];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">FR</div>
          <div>
            <h2>Field Report</h2>
            <p>Management System</p>
          </div>
        </div>

        <div className="sidebar-section-label">MENU UTAMA</div>

        <nav className="sidebar-nav">
          {userMenus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              end
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-link-icon">{menu.icon}</span>
              <span>{menu.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-role">
            <span className="role-dot" />
            <div>
              <span className="sidebar-role-label">Login sebagai</span>
              <strong>{roleLabels[user.role]}</strong>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Keluar dari aplikasi
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-context">
            <span className="header-overline">WORKSPACE</span>
            <span className="header-title">Field Report System</span>
          </div>

          <div className="header-user">
            <div className="header-avatar">
              {user.name.trim().charAt(0).toUpperCase()}
            </div>
            <div className="header-user-info">
              <strong>{user.name}</strong>
              <span>{roleLabels[user.role]}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>

        <footer className="dashboard-footer">
          Field Report Management System
        </footer>
      </div>
    </div>
  );
}