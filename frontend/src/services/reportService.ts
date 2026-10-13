
import { apiRequest } from "./api";
import type { Report, ReportApiResponse, UpdateReportPayload } from "../types/report";
import type { ReportHistoryApiResponse, ReportHistoryEntry } from "../types/reportHistory";

export async function getReports(): Promise<Report[]> {
  const response = await apiRequest<ReportApiResponse | Report[]>("/reports");

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && !Array.isArray(response.data)) {
    return response.data.reports ?? response.data.items ?? [];
  }

  return [];
}

export async function createReport(payload: { name: string; description: string; }): Promise<void> {
  const response = await apiRequest<{
    success: boolean;
    message?: string;
    data?: unknown;
  }>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new Error(response.message || "Gagal membuat laporan.");
  }
}

export async function updateReportStatus(id: string, status: "approved" | "rejected"): Promise<void> {
  const response = await apiRequest<{
    success: boolean;
    message?: string;
  }>(`/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!response.success) {
    throw new Error(
      response.message || "Gagal memperbarui status laporan."
    );
  }
}


export async function getReportHistory(reportId: string): Promise<ReportHistoryEntry[]> {
  const response = await apiRequest<ReportHistoryApiResponse>(
    `/reports/${reportId}/history`
  );

  if (!response.success) {
    throw new Error("Gagal mengambil riwayat keputusan.");
  }

  return response.data;
}

export async function updateReport(id: string, payload: UpdateReportPayload) {
  return apiRequest<{
    success: boolean
    message?: string
    data?: Report
  }>(`/reports/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}