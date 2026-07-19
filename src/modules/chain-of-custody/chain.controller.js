import asyncHandler from '../../utils/asyncHandler.js';
import {
  createChainEntry,
  getChainEntryById,
  getChainByEvidenceId,
  getChainEntries,
} from './chain.service.js';

export const createChainEntryController = asyncHandler(async (req, res) => {
  const entry = await createChainEntry({
    ...req.body,
    actionBy: req.body.actionBy || req.user?.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  return res.status(201).json({ success: true, message: 'Chain of custody entry created successfully', entry });
});

export const getChainEntryByIdController = asyncHandler(async (req, res) => {
  const entry = await getChainEntryById(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, message: 'Chain of custody entry not found' });
  }

  return res.json({ success: true, entry });
});

export const getChainEntriesByEvidenceIdController = asyncHandler(async (req, res) => {
  const entries = await getChainByEvidenceId(req.params.evidenceId);
  return res.json({ success: true, entries });
});

export const getAllChainEntriesController = asyncHandler(async (_req, res) => {
  const entries = await getChainEntries();
  return res.json({ success: true, entries });
});
