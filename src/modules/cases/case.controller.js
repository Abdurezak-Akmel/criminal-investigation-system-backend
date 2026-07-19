import asyncHandler from '../../utils/asyncHandler.js';
import {
  createCase,
  getCaseById,
  getCaseByCaseNumber,
  getCases,
  updateCase,
  deleteCase,
} from './case.service.js';

export const createCaseController = asyncHandler(async (req, res) => {
  const caseRecord = await createCase(req.body, req.user?.id);
  return res.status(201).json({ success: true, message: 'Case created successfully', case: caseRecord });
});

export const getCaseByIdController = asyncHandler(async (req, res) => {
  const caseRecord = await getCaseById(req.params.id);
  if (!caseRecord) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  return res.json({ success: true, case: caseRecord });
});

export const getCaseByCaseNumberController = asyncHandler(async (req, res) => {
  const caseRecord = await getCaseByCaseNumber(req.params.caseNumber);
  if (!caseRecord) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  return res.json({ success: true, case: caseRecord });
});

export const getAllCasesController = asyncHandler(async (_req, res) => {
  const cases = await getCases();
  return res.json({ success: true, cases });
});

export const updateCaseController = asyncHandler(async (req, res) => {
  const caseRecord = await updateCase(req.params.id, req.body);
  if (!caseRecord) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  return res.json({ success: true, message: 'Case updated successfully', case: caseRecord });
});

export const deleteCaseController = asyncHandler(async (req, res) => {
  const caseRecord = await deleteCase(req.params.id);
  if (!caseRecord) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  return res.json({ success: true, message: 'Case deleted successfully', case: caseRecord });
});
