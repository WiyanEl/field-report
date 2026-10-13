
import { useCallback, useEffect, useState } from "react";
import { getReports, updateReportStatus } from "../services/reportService";
import type { Report } from "../types/report";
import "./Approvals.css";

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function Approvals() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  async function handleStatusChange(
    report: Report,
    status: "approved" | "rejected"
  ) {
    const action = status === "approved" ? "menyetujui" : "menolak";

    if (
      !window.confirm(
        `Apakah kamu yakin ingin ${action} laporan "${report.name}"?`
      )
    ) {
      return;
    }

    setProcessingId(report.id);
    setError("");
    setNotice("");

    try {
      await updateReportStatus(report.id, status);

      setNotice(
        `Laporan "${report.name}" berhasil ${
          status === "approved" ? "disetujui" : "ditolak"
        }.`
      );

      // Ambil ulang data dari backend agar status tetap sinkron.
      await loadReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status laporan."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="approvals-page">
      <div className="approvals-heading">
        <div>
          <h1>Persetujuan Laporan</h1>
          <p>
            Tinjau laporan dan tentukan status persetujuannya.
          </p>
        </div>

        <button
          type="button"
          className="approvals-refresh"
          onClick={() => void loadReports()}
          disabled={loading || processingId !== null}
        >
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="approvals-alert approvals-alert-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="approvals-alert approvals-alert-success" role="status">
          {notice}
        </div>
      )}

      <div className="approvals-card">
        <div className="approvals-card-heading">
          <h2>Daftar laporan</h2>
          <span>{reports.length} laporan</span>
        </div>

        {loading ? (
          <div className="approvals-empty">Memuat data laporan...</div>
        ) : reports.length === 0 ? (
          <div className="approvals-empty">Belum ada laporan.</div>
        ) : (
          <div className="approvals-table-wrapper">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Nama laporan</th>
                  <th>Deskripsi</th>
                  <th>Dibuat</th>
                  <th>Status</th>
                  <th>Keputusan</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => {
                  const status = report.status.toLowerCase();
                  const processing = processingId === report.id;

                  return (
                    <tr key={report.id}>
                      <td className="approvals-report-name">
                        {report.name}
                      </td>

                      <td className="approvals-description">
                        {report.description}
                      </td>

                      <td>{formatDate(report.created_at)}</td>

                      <td>
                        <span
                          className={`approvals-status approvals-status-${status}`}
                        >
                          {status === "pending"
                            ? "Menunggu"
                            : status === "approved"
                              ? "Disetujui"
                              : status === "rejected"
                                ? "Ditolak"
                                : report.status}
                        </span>
                      </td>

                      <td>
                        <div className="approvals-actions">
                          <button
                            type="button"
                            className="approvals-approve"
                            disabled={processing || status === "approved"}
                            onClick={() =>
                              void handleStatusChange(report, "approved")
                            }
                          >
                            {processing ? "Memproses..." : "Setujui"}
                          </button>

                          <button
                            type="button"
                            className="approvals-reject"
                            disabled={processing || status === "rejected"}
                            onClick={() =>
                              void handleStatusChange(report, "rejected")
                            }
                          >
                            {processing ? "Memproses..." : "Tolak"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}