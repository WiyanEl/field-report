import db from '../config/database'

export type ReportStatus = 'pending' | 'approved' | 'rejected'

export interface CreateReportInput {
  user_id: string
  name: string
  description: string
}

export interface Report {
  id: string
  user_id: string
  name: string
  description: string
  status: ReportStatus
  created_at: Date
  updated_at: Date
}

export interface ApprovalHistory {
  id: string;
  report_id: string;
  approver_id: string;
  action: "approved" | "rejected";
  notes: string | null;
  created_at: Date;
}

export interface UpdateReportInput {
  name: string
  description: string
}

export async function getAllReports(userId?: string): Promise<Report[]> {
  const query = db('reports').select('*')

  if (userId) {
    query.where({ user_id: userId })
  }

  return query.orderBy('created_at', 'desc')
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const [report] = await db('reports')
    .insert({
      user_id: input.user_id,
      name: input.name,
      description: input.description,
    })
    .returning('*')

  return report
}

export async function updateReportStatus(id: string, status: Exclude<ReportStatus, 'pending'>, approverId: string, notes: string | null = null): Promise<Report | null> {
  return db.transaction(async (trx) => {
    const existing = await trx("reports")
      .where({ id })
      .forUpdate()
      .first();

    if (!existing) {
      return null;
    }

    const [report] = await trx("reports")
      .where({ id })
      .update({
        status,
        updated_at: trx.fn.now(),
      })
      .returning("*");

    await trx("report_approval_histories").insert({
      report_id: id,
      approver_id: approverId,
      action: status,
      notes,
    });

    return report as Report;
  });
}

export async function getApprovalHistory(reportId: string): Promise<ApprovalHistory[]> {
  return db("report_approval_histories")
    .select("*")
    .where({ report_id: reportId })
    .orderBy("created_at", "desc")
    .orderBy("id", "desc");
}

export async function updateReport(id: string, userId: string, input: UpdateReportInput): Promise<Report | null> {
  return db.transaction(async (trx) => {
    const existing = await trx('reports')
      .where({
        id,
        user_id: userId,
      })
      .forUpdate()
      .first()

    if (!existing) {
      return null
    }

    if (existing.status !== 'pending') {
      throw new Error('REPORT_NOT_PENDING')
    }

    const [report] = await trx('reports')
      .where({
        id,
        user_id: userId,
        status: 'pending',
      })
      .update({
        name: input.name,
        description: input.description,
        updated_at: trx.fn.now(),
      })
      .returning('*')

    if (!report) {
      throw new Error('REPORT_NOT_PENDING')
    }

    return report as Report
  })
}