
import { useCallback, useEffect, useState } from "react";
import { getReports, updateReport  } from "../services/reportService";
import { useAuth } from "../contexts/AuthContext";
import type { Report } from "../types/report";
import "./Reports.css";

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "Menunggu";
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    default:
      return status || "Tidak diketahui";
  }
}

interface EditReportFormProps {
  report: Report
  onCancel: () => void
  onSaved: () => Promise<void>
}

export default function Reports() {
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data laporan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const role = user?.role;

  const pageTitle =
    role === "admin"
      ? "Semua Laporan"
      : role === "approver"
        ? "Laporan untuk Ditinjau"
        : "Laporan Saya";

  const pageDescription =
    role === "admin"
      ? "Pantau laporan yang dibuat oleh seluruh pengguna."
      : role === "approver"
        ? "Tinjau laporan dan proses keputusan persetujuan."
        : "Kelola dan pantau status laporan yang kamu buat.";

  return (
    <section className="reports-page">
      <div className="reports-heading">
        <div>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>

        <button
          type="button"
          className="reports-refresh"
          onClick={() => void loadReports()}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Muat ulang"}
        </button>
      </div>

      <div className="reports-summary">
        <div className="reports-summary-card">
          <span>Total laporan</span>
          <strong>{reports.length}</strong>
        </div>

        <div className="reports-summary-card">
          <span>Menunggu</span>
          <strong>
            {reports.filter(
              (report) => report.status?.toLowerCase() === "pending"
            ).length}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span>Disetujui</span>
          <strong>
            {reports.filter(
              (report) => report.status?.toLowerCase() === "approved"
            ).length}
          </strong>
        </div>

        <div className="reports-summary-card">
          <span>Ditolak</span>
          <strong>
            {reports.filter(
              (report) => report.status?.toLowerCase() === "rejected"
            ).length}
          </strong>
        </div>
      </div>

      <div className="reports-table-card">
        <div className="reports-table-heading">
          <h2>Daftar laporan</h2>
          <span>{reports.length} laporan ditemukan</span>
        </div>

        {loading ? (
          <div className="reports-message">
            Memuat data laporan...
          </div>
        ) : error ? (
          <div className="reports-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadReports()}>
              Coba lagi
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="reports-message">
            Belum ada laporan untuk ditampilkan.
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Deskripsi</th>
                  <th>Status</th>
                  <th>Tanggal dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="reports-title-cell">
                      {report.name}
                    </td>
                    <td className="reports-description-cell">
                      {report.description}
                    </td>
                    <td>
                      <span
                        className={`report-status report-status-${report.status?.toLowerCase()}`}
                      >
                        {statusLabel(report.status)}
                      </span>
                    </td>
                    <td>{formatDate(report.created_at)}</td>
                    <td>
                      {user?.role === "reporter" &&
                        report.user_id === user.id &&
                        report.status === "pending" && (
                          <button
                            type="button"
                            className="btn-edit-report"
                            onClick={() => {
                              setSuccessMessage("")
                              setEditingReport(report)
                            }}
                          >
                            Edit
                          </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingReport && (
        <EditReportForm
          key={editingReport.id}
          report={editingReport}
          onCancel={() => setEditingReport(null)}
          onSaved={async () => {
            setEditingReport(null)
            setSuccessMessage("Laporan berhasil diperbarui.")
            await loadReports()
          }}
        />
      )}

      {successMessage && (
        <p className="success-message">{successMessage}</p>
      )}

    </section>
  );
}

export function EditReportForm({ report, onCancel, onSaved }: EditReportFormProps) {
  const [name, setName] = useState(report.name)
  const [description, setDescription] = useState(report.description)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError("")

    if (!name.trim() || !description.trim()) {
      setError("Nama dan deskripsi wajib diisi.")
      return
    }

    try {
      setSaving(true)

      const response = await updateReport(report.id, {
        name: name.trim(),
        description: description.trim(),
      })

      if (!response.success) {
        throw new Error(
          response.message || "Gagal memperbarui laporan."
        )
      }

      await onSaved()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan laporan."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-report-form">
      <h3>Edit Laporan</h3>

      <label htmlFor="edit-report-name">Nama laporan</label>
      <input
        id="edit-report-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={150}
        required
      />

      <label htmlFor="edit-report-description">Deskripsi</label>
      <textarea
        id="edit-report-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={5}
        required
      />

      {error && <p className="error-message">{error}</p>}

      <div className="edit-report-actions">
        <button type="button" className="btn-cancel-report" onClick={onCancel} disabled={saving}>
          Batal
        </button>

        <button type="submit" className="btn-save-report" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  )
}