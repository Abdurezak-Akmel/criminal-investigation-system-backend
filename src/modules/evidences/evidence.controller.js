import asyncHandler from '../../utils/asyncHandler.js';
import {
  createEvidence,
  deleteEvidence,
  getAllEvidence,
  getEvidenceByCaseId,
  getEvidenceById,
  getMyReports,
  getReportFile,
  getReports,
  updateEvidence,
} from './evidence.service.js';
import { safeDeleteFile } from './evidence.storage.js';

export const createEvidenceController = asyncHandler(async (req, res) => {
  try {
    const evidence = await createEvidence({
      body: req.body,
      file: req.file,
      user: {
        ...req.user,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.status(201).json({ success: true, message: 'Evidence uploaded successfully', evidence });
  } catch (error) {
    if (req.file?.path) {
      await safeDeleteFile(req.file.path);
    }
    throw error;
  }
});

export const getEvidenceByIdController = asyncHandler(async (req, res) => {
  const evidence = await getEvidenceById(req.params.id);
  if (!evidence) {
    return res.status(404).json({ success: false, message: 'Evidence not found' });
  }

  return res.json({ success: true, evidence });
});

export const getEvidenceByCaseIdController = asyncHandler(async (req, res) => {
  const evidence = await getEvidenceByCaseId(req.params.caseId);
  return res.json({ success: true, evidence });
});

export const getAllEvidenceController = asyncHandler(async (req, res) => {
  const evidence = await getAllEvidence(req.query);
  return res.json({ success: true, evidence });
});

export const updateEvidenceController = asyncHandler(async (req, res) => {
  const evidence = await updateEvidence(req.params.id, req.body, req.file);
  if (!evidence) {
    return res.status(404).json({ success: false, message: 'Evidence not found' });
  }

  return res.json({ success: true, message: 'Evidence updated successfully', evidence });
});

export const deleteEvidenceController = asyncHandler(async (req, res) => {
  const evidence = await deleteEvidence(req.params.id);
  if (!evidence) {
    return res.status(404).json({ success: false, message: 'Evidence not found' });
  }

  return res.json({ success: true, message: 'Evidence deleted successfully', evidence });
});

export const submitReportController = createEvidenceController;

export const getMyReportsController = asyncHandler(async (req, res) => {
  const reports = await getMyReports(req.user.id);
  return res.json(reports);
});

export const getMyReportCountController = asyncHandler(async (req, res) => {
  const reports = await getMyReports(req.user.id);
  return res.json({ count: reports.length });
});

export const getReportsController = asyncHandler(async (req, res) => {
  const reports = await getReports(req.query);
  return res.json(reports);
});

export const getReportCountController = asyncHandler(async (req, res) => {
  const reports = await getReports(req.query);
  return res.json({ count: reports.length });
});

export const downloadReportController = asyncHandler(async (req, res) => {
  const file = await getReportFile(req.params.id);
  if (!file) {
    return res.status(404).json({ success: false, message: 'Evidence not found' });
  }

  return res.download(file.path, file.filename);
});
