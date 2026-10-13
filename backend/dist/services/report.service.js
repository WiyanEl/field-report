"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReports = getAllReports;
exports.createReport = createReport;
exports.updateReportStatus = updateReportStatus;
exports.getApprovalHistory = getApprovalHistory;
const database_1 = __importDefault(require("../config/database"));
async function getAllReports(userId) {
    const query = (0, database_1.default)('reports').select('*');
    if (userId) {
        query.where({ user_id: userId });
    }
    return query.orderBy('created_at', 'desc');
}
async function createReport(input) {
    const [report] = await (0, database_1.default)('reports')
        .insert({
        user_id: input.user_id,
        name: input.name,
        description: input.description,
    })
        .returning('*');
    return report;
}
async function updateReportStatus(id, status, approverId, notes = null) {
    return database_1.default.transaction(async (trx) => {
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
        return report;
    });
}
async function getApprovalHistory(reportId) {
    return (0, database_1.default)("report_approval_histories")
        .select("*")
        .where({ report_id: reportId })
        .orderBy("created_at", "desc")
        .orderBy("id", "desc");
}
