import { Request, Response } from "express"
import { createReport, getAllReports, updateReportStatus, getApprovalHistory, ReportStatus, updateReport } from "../services/report.service"

const allowedStatuses = ["approved", "rejected"] as const

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function listReports(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!

    const reports = await getAllReports(user.role === 'reporter' ? user.id : undefined)

    if (reports.length === 0) {
      res.status(404).json({
        success: false,
        message: "Daftar laporan tidak ditemukan",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: reports,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar laporan",
    })
  }
}

export async function addReport(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body ?? {}

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Nama wajib diisi",
      })
      return
    }

    if (typeof description !== "string" || !description.trim()) {
      res.status(400).json({
        success: false,
        message: "Deskripsi wajib diisi",
      })
      return
    }

    if (name.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "Nama laporan maksimal 150 karakter",
      });
      return;
    }

    const user = req.user!

    const report = await createReport({ 
      user_id: user.id,
      name: name.trim(), 
      description: description.trim() 
    })

    res.status(201).json({
      success: true,
      message: "Laporan berhasil dibuat",
      data: report,
    })
  } catch (error) {
    console.error("Error adding report:", error)
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan laporan",
    })
  }
}

export async function changeReportStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { status, notes } = req.body ?? {}

    if (typeof id !== "string" || !isValidUUID(id)) {
      res.status(400).json({
        success: false,
        message: "ID laporan tidak valid",
      });
      return;
    }

    if (typeof status !== "string" || !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
      res.status(400).json({
        success: false,
        message: "Status tidak valid. Hanya 'approved' atau 'rejected' yang diperbolehkan",
      })
      return
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

    const report = await updateReportStatus(id, status as Exclude<ReportStatus, 'pending'>, req.user.id, typeof notes === "string" ? notes.trim() || null : null)

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Status laporan berhasil diperbarui",
      data: report,
    })
  } catch (error) {
    console.error("Error updating report status:", error)
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui status laporan",
    })
  }
}


export async function listApprovalHistory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !isValidUUID(id)) {
      res.status(400).json({
        success: false,
        message: "ID laporan tidak valid",
      });
      return;
    }

    const history = await getApprovalHistory(id);

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
  } catch (error) {
    console.error("Error fetching approval history:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat persetujuan",
    });
  }
}


export async function editReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description } = req.body ?? {};

    if (typeof id !== "string" || !isValidUUID(id)) {
      res.status(400).json({
        success: false,
        message: "ID laporan tidak valid",
      });
      return;
    }

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Nama wajib diisi",
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

    if (typeof description !== "string" || !description.trim()) {
      res.status(400).json({
        success: false,
        message: "Deskripsi wajib diisi",
      });
      return;
    }

    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan",
      });
      return;
    }

    const report = await updateReport(id, user.id, {
      name: name.trim(),
      description: description.trim(),
    });

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Laporan berhasil diperbarui",
      data: report,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "REPORT_NOT_PENDING"
    ) {
      res.status(409).json({
        success: false,
        message: "Laporan tidak dapat diedit karena sudah diproses",
      });
      return;
    }

    console.error("Error editing report:", error);

    res.status(500).json({
      success: false,
      message: "Gagal memperbarui laporan",
    });
  }
}