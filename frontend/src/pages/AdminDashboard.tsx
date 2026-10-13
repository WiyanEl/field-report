
import { useCallback, useEffect, useState } from "react";
import { getReports } from "../services/reportService";
import { getUsers } from "../services/userService";
import type { Report } from "../types/report";
import type { ManagedUser } from "../types/user";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [reportData, userData] = await Promise.all([
        getReports(),
        getUsers(),
      ]);

      setReports(reportData);
      setUsers(userData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const countStatus = (status: string) =>
    reports.filter(
      (report) => report.status.toLowerCase() === status
    ).length;

  const activeUsers = users.filter((user) => user.is_active).length;

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-heading">
        <div>
          <h1>Dashboard Admin</h1>
          <p>Ringkasan aktivitas dan laporan Field Report.</p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="admin-dashboard-refresh"
        >
          {loading ? "Memuat..." : "Muat ulang"}
        </button>
      </div>

      {error && (
        <div className="admin-dashboard-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadDashboard()}>
            Coba lagi
          </button>
        </div>
      )}

      <div className="admin-dashboard-grid">
        <article className="admin-stat-card">
          <span>Total laporan</span>
          <strong>{loading ? "—" : reports.length}</strong>
          <small>Seluruh laporan yang dapat diakses</small>
        </article>

        <article className="admin-stat-card">
          <span>Menunggu</span>
          <strong>{loading ? "—" : countStatus("pending")}</strong>
          <small>Menunggu keputusan</small>
        </article>

        <article className="admin-stat-card">
          <span>Disetujui</span>
          <strong>{loading ? "—" : countStatus("approved")}</strong>
          <small>Laporan yang disetujui</small>
        </article>

        <article className="admin-stat-card">
          <span>Ditolak</span>
          <strong>{loading ? "—" : countStatus("rejected")}</strong>
          <small>Laporan yang ditolak</small>
        </article>

        <article className="admin-stat-card">
          <span>Total pengguna</span>
          <strong>{loading ? "—" : users.length}</strong>
          <small>{activeUsers} akun aktif</small>
        </article>
      </div>

      <div className="admin-dashboard-panel">
        <div className="admin-dashboard-panel-heading">
          <div>
            <h2>Laporan terbaru</h2>
            <p>Lima laporan berdasarkan tanggal pembuatan.</p>
          </div>
        </div>

        {loading ? (
          <div className="admin-dashboard-empty">
            Memuat laporan...
          </div>
        ) : recentReports.length === 0 ? (
          <div className="admin-dashboard-empty">
            Belum ada laporan.
          </div>
        ) : (
          <div className="admin-dashboard-table-wrapper">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  <th>Nama laporan</th>
                  <th>Status</th>
                  <th>Tanggal dibuat</th>
                </tr>
              </thead>

              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.name}</td>
                    <td>
                      <span
                        className={`admin-status admin-status-${report.status.toLowerCase()}`}
                      >
                        {report.status === "pending"
                          ? "Menunggu"
                          : report.status === "approved"
                            ? "Disetujui"
                            : report.status === "rejected"
                              ? "Ditolak"
                              : report.status}
                      </span>
                    </td>
                    <td>
                      {report.created_at
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(report.created_at))
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}