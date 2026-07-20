import express from 'express';
import {
  downloadReportController,
  getReportCountController,
  getReportsController,
} from '../evidences/evidence.controller.js';
import { inviteAdmin } from '../auth/auth.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = express.Router();

// Admin verification
router.use(verifyToken, requireAdmin);

router.post('/generate-code', inviteAdmin);
router.get('/reports', getReportsController);
router.get('/reports/count', getReportCountController);
router.get('/download/:id', downloadReportController);

export default router;
