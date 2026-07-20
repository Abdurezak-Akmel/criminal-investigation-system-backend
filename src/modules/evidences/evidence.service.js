import fs from 'fs/promises';
import Evidence from './evidence.model.js';
import Case from '../cases/case.model.js';
import { createChainEntry } from '../chain-of-custody/chain.service.js';
import {
  buildEvidenceMetadata,
  getStoredPath,
  resolveStoredPath,
  safeDeleteFile,
} from './evidence.storage.js';

function toReport(evidence) {
  const record = evidence.toObject ? evidence.toObject() : evidence;
  const caseRecord = record.caseId && typeof record.caseId === 'object' ? record.caseId : null;
  const uploader = record.uploadedBy && typeof record.uploadedBy === 'object' ? record.uploadedBy : null;

  return {
    id: record._id?.toString() || record.id,
    title: caseRecord?.title || record.description || record.originalFilename,
    description: record.description,
    original_filename: record.originalFilename,
    file_type: record.fileType,
    file_size: record.fileSize,
    status: record.status,
    submitted_at: record.uploadedAt,
    user_email: uploader?.email,
    uploaded_by: uploader?._id?.toString() || record.uploadedBy?.toString(),
    case_id: caseRecord?._id?.toString() || record.caseId?.toString(),
  };
}

async function createFallbackCase({ title, description, userId }) {
  return Case.create({
    caseNumber: `CASE-${Date.now()}`,
    title: title || 'Evidence report',
    description: description || title || 'Evidence report submitted through portal',
    incidentDate: new Date(),
    submittedBy: userId,
  });
}

export async function createEvidence({ body, file, user }) {
  if (!file) {
    const error = new Error('A file is required');
    error.statusCode = 400;
    throw error;
  }

  const userId = body.uploadedBy || user?.id;
  if (!userId) {
    const error = new Error('Authenticated user is required');
    error.statusCode = 401;
    throw error;
  }

  const caseRecord = body.caseId
    ? await Case.findById(body.caseId)
    : await createFallbackCase({
        title: body.title,
        description: body.description,
        userId,
      });

  if (!caseRecord) {
    const error = new Error('Case not found');
    error.statusCode = 404;
    throw error;
  }

  const metadata = await buildEvidenceMetadata(file.path);
  const evidence = await Evidence.create({
    caseId: caseRecord.id,
    uploadedBy: userId,
    evidenceTagNumber: body.evidenceTagNumber,
    description: body.description || body.title,
    originalFilename: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    filePath: getStoredPath(file.path),
    ...metadata,
    status: body.status || 'submitted',
    retentionExpirationDate: body.retentionExpirationDate,
  });

  await createChainEntry({
    caseId: caseRecord.id,
    evidenceId: evidence.id,
    actionBy: userId,
    actionType: 'SUBMITTED',
    newStatus: evidence.status,
    reasonForAction: 'Evidence submitted',
    ipAddress: user?.ip || 'unknown',
    userAgent: user?.userAgent,
  });

  return evidence.populate('caseId uploadedBy', 'caseNumber title email fullName role');
}

export function getEvidenceById(id) {
  return Evidence.findById(id).populate('caseId uploadedBy reviewedBy', 'caseNumber title email fullName role');
}

export function getEvidenceByCaseId(caseId) {
  return Evidence.find({ caseId })
    .sort({ uploadedAt: -1 })
    .populate('caseId uploadedBy reviewedBy', 'caseNumber title email fullName role');
}

export function getAllEvidence(filters = {}) {
  const query = {};
  if (filters.status) query.status = filters.status;
  return Evidence.find(query)
    .sort({ uploadedAt: -1 })
    .populate('caseId uploadedBy reviewedBy', 'caseNumber title email fullName role');
}

export async function updateEvidence(id, updates, file) {
  const evidence = await Evidence.findById(id);
  if (!evidence) return null;

  if (file) {
    await safeDeleteFile(resolveStoredPath(evidence.filePath));
    Object.assign(evidence, {
      originalFilename: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: getStoredPath(file.path),
      ...(await buildEvidenceMetadata(file.path)),
    });
  }

  Object.assign(evidence, updates);
  await evidence.save();
  return getEvidenceById(evidence.id);
}

export async function deleteEvidence(id) {
  const evidence = await Evidence.findByIdAndDelete(id);
  if (evidence?.filePath) {
    await safeDeleteFile(resolveStoredPath(evidence.filePath));
  }

  return evidence;
}

export async function getMyReports(userId) {
  const evidence = await Evidence.find({ uploadedBy: userId })
    .sort({ uploadedAt: -1 })
    .populate('caseId uploadedBy', 'caseNumber title email fullName role');

  return evidence.map(toReport);
}

export async function getReports(filters = {}) {
  const evidence = await Evidence.find()
    .sort({ uploadedAt: -1 })
    .populate('caseId uploadedBy', 'caseNumber title email fullName role');

  return evidence
    .map(toReport)
    .filter((report) => {
      if (filters.email && !report.user_email?.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.title && !report.title?.toLowerCase().includes(filters.title.toLowerCase())) return false;
      if (filters.date && new Date(report.submitted_at).toISOString().slice(0, 10) !== filters.date) return false;
      return true;
    });
}

export async function getReportFile(id) {
  const evidence = await Evidence.findById(id);
  if (!evidence) return null;

  await fs.access(resolveStoredPath(evidence.filePath));
  return {
    path: resolveStoredPath(evidence.filePath),
    filename: evidence.originalFilename,
  };
}
