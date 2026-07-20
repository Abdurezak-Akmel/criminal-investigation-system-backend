import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

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
    const safeName = file.originalname.replace(/[^\w.-]+/g, '_');
    cb(null, `${Date.now()}-${crypto.randomUUID()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export function getStoredPath(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

export async function safeDeleteFile(filePath) {
  if (!filePath) return;
  await fs.unlink(filePath).catch(() => {});
}

export async function buildEvidenceMetadata(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const fileKey = crypto.randomBytes(32).toString('hex');

  return {
    fileKeyEncrypted: crypto.createHash('sha256').update(fileKey).digest('hex'),
    iv: crypto.randomBytes(16).toString('hex'),
    fileSha256: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
  };
}

export function resolveStoredPath(filePath) {
  return path.resolve(process.cwd(), filePath);
}
