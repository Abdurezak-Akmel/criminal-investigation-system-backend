import express from 'express';
import {
  createEvidenceController,
  getEvidenceByIdController,
  getEvidenceByCaseIdController,
  getAllEvidenceController,
  updateEvidenceController,
  deleteEvidenceController,
  upload,
} from '../controllers/evidenceControllers.js';

const router = express.Router();

router.post('/', upload.single('file'), createEvidenceController);
router.get('/', getAllEvidenceController);
router.get('/case/:caseId', getEvidenceByCaseIdController);
router.get('/:id', getEvidenceByIdController);
router.put('/:id', upload.single('file'), updateEvidenceController);
router.delete('/:id', deleteEvidenceController);

export default router;
