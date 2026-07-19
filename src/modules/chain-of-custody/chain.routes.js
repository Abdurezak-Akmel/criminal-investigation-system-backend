import express from 'express';
import {
  createChainEntryController,
  getChainEntryByIdController,
  getChainEntriesByEvidenceIdController,
  getAllChainEntriesController,
} from './chain.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', createChainEntryController);
router.get('/', requireAdmin, getAllChainEntriesController);
router.get('/evidence/:evidenceId', getChainEntriesByEvidenceIdController);
router.get('/:id', getChainEntryByIdController);

export default router;
