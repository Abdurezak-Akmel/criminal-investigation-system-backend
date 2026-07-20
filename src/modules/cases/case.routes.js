import express from 'express';
import {
  createCaseController,
  getCaseByIdController,
  getCaseByCaseNumberController,
  getAllCasesController,
  updateCaseController,
  deleteCaseController,
} from './case.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createCaseController);
router.get('/', getAllCasesController);
router.get('/number/:caseNumber', getCaseByCaseNumberController);
router.get('/:id', getCaseByIdController);
router.put('/:id', requireAdmin, updateCaseController);
router.delete('/:id', requireAdmin, deleteCaseController);

export default router;
