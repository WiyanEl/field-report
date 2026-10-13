
export type ReportStatus = "pending" | "approved" | "rejected";

export interface Report {
  id: string;
  name: string;
  description: string;
  status: ReportStatus | string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ReportApiResponse {
  success: boolean;
  data: Report[];
}

export interface UpdateReportPayload {
  name: string
  description: string
}