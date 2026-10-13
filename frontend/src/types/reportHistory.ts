
export type ApprovalAction = "approved" | "rejected";

export interface ReportHistoryEntry {
  id: string;
  report_id: string;
  approver_id: string;
  action: ApprovalAction | string;
  notes: string | null;
  created_at: string;
}

export interface ReportHistoryApiResponse {
  success: boolean;
  data: ReportHistoryEntry[];
}