
import { useCallback, useEffect, useState } from "react";
import {
  getReports,
  getReportHistory,
} from "../services/reportService";
import type { Report } from "../types/report";
import type { ReportHistoryEntry } from "../types/reportHistory";
import "./DecisionHistory.css";

type DecisionFilter = "all" | "approved" | "rejected";

interface HistoryRow extends ReportHistoryEntry {
  report_name: string;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getActionLabel(action: string) {
  switch (action.toLowerCase()) {
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    default:
      return action;
  }
}

export default function DecisionHistory() {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [filter, setFilter] = useState<DecisionFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarning("");

    try {
      const reports = await getReports();

      const results = await Promise.allSettled(
        reports.map(async (report) => {
          const entries = await getReportHistory(report.id);

          return entries.map((entry) => ({
            ...entry,
            report_name: report.name,
          }));
        })
      );

      const rows: HistoryRow[] = [];
      let failedCount = 0;

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          rows.push(...result.value);
        } else {
          failedCount++;
        }
      });

      rows.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setHistory(rows);

      if (failedCount > 0) {
        setWarning(
          `Riwayat dari ${failedCount} laporan gagal dimuat. Data yang tampil mungkin belum lengkap.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil riwayat keputusan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    return item.action.toLowerCase() === filter;
  });

  const approvedCount = history.filter(
    (item) => item.action.toLowerCase() === "approved"
  ).length;

  const rejectedCount = history.filter(
    (item) => item.action.toLowerCase() === "rejected"
  ).length;

  return (
    <section className="decision-history-page">
      <div className="decision-history-heading">
        <div>
          <span className="decision-history-breadcrumb">
            Persetujuan / Riwayat Keputusan
          </span>
          <h1>Riwayat Keputusan</h1>
          <p>
            Lihat seluruh catatan persetujuan dan penolakan laporan.
          </p>
        </div>

        <button
          type="button"
          className="decision-history-refresh"
          onClick={() => void loadHistory()}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Muat ulang"}
        </button>
      </div>

      <div className="decision-history-summary">
        <div className="decision-history-summary-card">
          <span>Total keputusan</span>
          <strong>{history.length}</strong>
        </div>

        <div className="decision-history-summary-card">
          <span>Disetujui</span>
          <strong>{approvedCount}</strong>
        </div>

        <div className="decision-history-summary-card">
          <span>Ditolak</span>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      <div className="decision-history-card">
        <div className="decision-history-toolbar">
          <div>
            <h2>Catatan keputusan</h2>
            <p>{filteredHistory.length} catatan ditemukan</p>
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as DecisionFilter)
            }
            aria-label="Filter keputusan"
          >
            <option value="all">Semua keputusan</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {warning && (
          <div className="decision-history-warning" role="status">
            {warning}
          </div>
        )}

        {error ? (
          <div className="decision-history-message decision-history-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadHistory()}>
              Coba lagi
            </button>
          </div>
        ) : loading ? (
          <div className="decision-history-message">
            Memuat riwayat keputusan...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="decision-history-message">
            Belum ada riwayat keputusan untuk filter ini.
          </div>
        ) : (
          <div className="decision-history-table-wrapper">
            <table className="decision-history-table">
              <thead>
                <tr>
                  <th>Nama laporan</th>
                  <th>Keputusan</th>
                  <th>Catatan</th>
                  <th>Waktu keputusan</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map((item) => {
                  const action = item.action.toLowerCase();

                  return (
                    <tr key={item.id}>
                      <td className="decision-history-name">
                        {item.report_name}
                      </td>

                      <td>
                        <span
                          className={`decision-history-status decision-history-status-${action}`}
                        >
                          {getActionLabel(action)}
                        </span>
                      </td>

                      <td className="decision-history-description">
                        {item.notes?.trim() || "-"}
                      </td>

                      <td>{formatDate(item.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="decision-history-note">
        Setiap baris merupakan satu catatan keputusan. Satu laporan dapat
        memiliki beberapa catatan jika keputusannya diubah.
      </p>
    </section>
  );
}