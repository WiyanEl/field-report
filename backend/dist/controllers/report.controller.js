"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReports = listReports;
exports.addReport = addReport;
exports.changeReportStatus = changeReportStatus;
exports.listApprovalHistory = listApprovalHistory;
const report_service_1 = require("../services/report.service");
const allowedStatuses = ["approved", "rejected"];
function isValidUUID(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
async function listReports(req, res) {
    try {
        const user = req.user;
        const reports = await (0, report_service_1.getAllReports)(user.role === 'reporter' ? user.id : undefined);
        if (reports.length === 0) {
            res.status(404).json({
                success: false,
                message: "Daftar laporan tidak ditemukan",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: reports,
        });
    }
    catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar laporan",
        });
    }
}
async function addReport(req, res) {
    try {
        const { name, description } = req.body ?? {};
        if (typeof name !== "string" || !name.trim()) {
            res.status(400).json({
                success: false,
                message: "Nama wajib diisi",
            });
            return;
        }
        if (typeof description !== "string" || !description.trim()) {
            res.status(400).json({
                success: false,
                message: "Deskripsi wajib diisi",
            });
            return;
        }
        if (name.trim().length > 150) {
            res.status(400).json({
                success: false,
                message: "Nama laporan maksimal 150 karakter",
            });
            return;
        }
        const user = req.user;
        const report = await (0, report_service_1.createReport)({
            user_id: user.id,
            name: name.trim(),
            description: description.trim()
        });
        res.status(201).json({
            success: true,
            message: "Laporan berhasil dibuat",
            data: report,
        });
    }
    catch (error) {
        console.error("Error adding report:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menambahkan laporan",
        });
    }
}
async function changeReportStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, notes } = req.body ?? {};
        if (typeof id !== "string" || !isValidUUID(id)) {
            res.status(400).json({
                success: false,
                message: "ID laporan tidak valid",
            });
            return;
        }
        if (typeof status !== "string" || !allowedStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: "Status tidak valid. Hanya 'approved' atau 'rejected' yang diperbolehkan",
            });
            return;
        }
        if (notes !== undefined && notes !== null && (typeof notes !== "string" || notes.length > 2000)) {
            res.status(400).json({
                success: false,
                message: "Catatan harus berupa teks maksimal 2000 karakter",
            });
            return;
        }
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Autentikasi diperlukan",
            });
            return;
        }
        const report = await (0, report_service_1.updateReportStatus)(id, status, req.user.id, typeof notes === "string" ? notes.trim() || null : null);
        if (!report) {
            res.status(404).json({
                success: false,
                message: "Laporan tidak ditemukan",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Status laporan berhasil diperbarui",
            data: report,
        });
    }
    catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui status laporan",
        });
    }
}
async function listApprovalHistory(req, res) {
    try {
        const { id } = req.params;
        if (typeof id !== "string" || !isValidUUID(id)) {
            res.status(400).json({
                success: false,
                message: "ID laporan tidak valid",
            });
            return;
        }
        const history = await (0, report_service_1.getApprovalHistory)(id);
        if (history.length === 0) {
            res.status(404).json({
                success: false,
                message: "Riwayat persetujuan tidak ditemukan",
            });
        }
        res.status(200).json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        console.error("Error fetching approval history:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat persetujuan",
        });
    }
}
