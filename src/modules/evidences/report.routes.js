import express from 'express';
import {
  downloadReportController,
  getMyReportCountController,
  getMyReportsController,
  submitReportController,
} from './evidence.controller.js';
import { upload } from './evidence.storage.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/submit', upload.single('file'), submitReportController);
router.get('/my-reports', getMyReportsController);
router.get('/count', getMyReportCountController);
router.get('/download/:id', downloadReportController);

export default router;
