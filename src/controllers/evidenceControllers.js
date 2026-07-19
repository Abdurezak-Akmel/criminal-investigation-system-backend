import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import {
  createEvidenceAttachment,
  getEvidenceAttachmentById,
  getEvidenceAttachmentsByCaseId,
  getAllEvidenceAttachments,
  updateEvidenceAttachment,
  deleteEvidenceAttachment,
} from '../../database/models/evidenceModels.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file) {
      return cb(new Error('No file provided'));
    }

    cb(null, true);
  },
});

function getStoredPath(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function buildEvidenceMetadata(fileBuffer) {
  const fileKey = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16).toString('hex');
  const fileSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const fileKeyEncrypted = crypto.createHash('sha256').update(fileKey).digest('hex');

  return {
    fileKeyEncrypted,
    iv,
    fileSha256,
  };
}

function safeDeleteFile(filePath) {
  if (!filePath) return Promise.resolve();

  return fs.unlink(filePath).catch(() => {});
}

export async function createEvidenceController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A file is required' });
    }

    const {
      caseId,
      uploadedBy = req.user?.id ?? null,
      evidenceTagNumber = null,
      description = null,
      status = 'submitted',
      reviewedBy = null,
      reviewNotes = null,
      retentionExpirationDate = null,
    } = req.body;

    if (!caseId) {
      await safeDeleteFile(req.file.path);
      return res.status(400).json({ success: false, message: 'Case ID is required' });
    }

    const fileBuffer = await fs.readFile(req.file.path);
    const { fileKeyEncrypted, iv, fileSha256 } = buildEvidenceMetadata(fileBuffer);
    const filePath = getStoredPath(req.file.path);

    const evidence = await createEvidenceAttachment({
      caseId,
      uploadedBy,
      evidenceTagNumber,
      description,
      originalFilename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath,
      fileKeyEncrypted,
      iv,
      fileSha256,
      status,
      reviewedBy,
      reviewNotes,
      retentionExpirationDate,
    });

    return res.status(201).json({ success: true, message: 'Evidence uploaded successfully', evidence });
  } catch (error) {
    console.error('createEvidenceController error:', error);
    if (req.file?.path) {
      await safeDeleteFile(req.file.path);
    }
    return res.status(500).json({ success: false, message: 'Failed to upload evidence' });
  }
}

export async function getEvidenceByIdController(req, res) {
  try {
    const { id } = req.params;
    const evidence = await getEvidenceAttachmentById(id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    return res.json({ success: true, evidence });
  } catch (error) {
    console.error('getEvidenceByIdController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch evidence' });
  }
}

export async function getEvidenceByCaseIdController(req, res) {
  try {
    const { caseId } = req.params;
    const evidence = await getEvidenceAttachmentsByCaseId(caseId);

    return res.json({ success: true, evidence });
  } catch (error) {
    console.error('getEvidenceByCaseIdController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch evidence for case' });
  }
}

export async function getAllEvidenceController(req, res) {
  try {
    const evidence = await getAllEvidenceAttachments();
    return res.json({ success: true, evidence });
  } catch (error) {
    console.error('getAllEvidenceController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch evidence' });
  }
}

export async function updateEvidenceController(req, res) {
  try {
    const { id } = req.params;
    const existingEvidence = await getEvidenceAttachmentById(id);

    if (!existingEvidence) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    const updates = { ...req.body };

    if (req.file) {
      const fileBuffer = await fs.readFile(req.file.path);
      const { fileKeyEncrypted, iv, fileSha256 } = buildEvidenceMetadata(fileBuffer);
      const filePath = getStoredPath(req.file.path);

      await safeDeleteFile(existingEvidence.filePath ? path.resolve(process.cwd(), existingEvidence.filePath) : null);

      updates.originalFilename = req.file.originalname;
      updates.fileType = req.file.mimetype;
      updates.fileSize = req.file.size;
      updates.filePath = filePath;
      updates.fileKeyEncrypted = fileKeyEncrypted;
      updates.iv = iv;
      updates.fileSha256 = fileSha256;
    }

    const updatedEvidence = await updateEvidenceAttachment(id, updates);
    return res.json({ success: true, message: 'Evidence updated successfully', evidence: updatedEvidence });
  } catch (error) {
    console.error('updateEvidenceController error:', error);
    if (req.file?.path) {
      await safeDeleteFile(req.file.path);
    }
    return res.status(500).json({ success: false, message: 'Failed to update evidence' });
  }
}

export async function deleteEvidenceController(req, res) {
  try {
    const { id } = req.params;
    const existingEvidence = await getEvidenceAttachmentById(id);

    if (!existingEvidence) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    if (existingEvidence.filePath) {
      const absolutePath = path.resolve(process.cwd(), existingEvidence.filePath);
      await safeDeleteFile(absolutePath);
    }

    const deletedEvidence = await deleteEvidenceAttachment(id);
    return res.json({ success: true, message: 'Evidence deleted successfully', evidence: deletedEvidence });
  } catch (error) {
    console.error('deleteEvidenceController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete evidence' });
  }
}

export default {
  createEvidenceController,
  getEvidenceByIdController,
  getEvidenceByCaseIdController,
  getAllEvidenceController,
  updateEvidenceController,
  deleteEvidenceController,
};
