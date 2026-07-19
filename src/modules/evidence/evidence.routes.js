import express from 'express';
import {
  createEvidenceController,
  deleteEvidenceController,
  getAllEvidenceController,
  getEvidenceByCaseIdController,
  getEvidenceByIdController,
  updateEvidenceController,
} from './evidence.controller.js';
import { upload } from './evidence.storage.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', upload.single('file'), createEvidenceController);
router.get('/', requireAdmin, getAllEvidenceController);
router.get('/case/:caseId', getEvidenceByCaseIdController);
router.get('/:id', getEvidenceByIdController);
router.put('/:id', upload.single('file'), updateEvidenceController);
router.delete('/:id', requireAdmin, deleteEvidenceController);

export default router;
