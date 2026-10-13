import { Router } from 'express'
import { listReports, addReport, editReport, changeReportStatus, listApprovalHistory } from '../controllers/report.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, listReports)
router.get("/:id/history", authenticate, authorize("admin", "approver"), listApprovalHistory)

router.post('/', authenticate, authorize("reporter"), addReport)

router.patch('/:id', authenticate, authorize('reporter'), editReport)
router.patch('/:id/status', authenticate, authorize("approver"), changeReportStatus)

export default router