import db from '../config/db.js';

function mapEvidenceRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    caseId: row.case_id,
    uploadedBy: row.uploaded_by,
    evidenceTagNumber: row.evidence_tag_number,
    description: row.description,
    originalFilename: row.original_filename,
    fileType: row.file_type,
    fileSize: row.file_size,
    filePath: row.file_path,
    fileKeyEncrypted: row.file_key_encrypted,
    iv: row.iv,
    fileSha256: row.file_sha256,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewNotes: row.review_notes,
    reviewedAt: row.reviewed_at,
    uploadedAt: row.uploaded_at,
    retentionExpirationDate: row.retention_expiration_date,
  };
}

export async function createEvidenceAttachment({
  caseId,
  uploadedBy = null,
  evidenceTagNumber = null,
  description = null,
  originalFilename,
  fileType,
  fileSize,
  filePath,
  fileKeyEncrypted,
  iv,
  fileSha256,
  status = 'submitted',
  reviewedBy = null,
  reviewNotes = null,
  reviewedAt = null,
  retentionExpirationDate = null,
}) {
  const result = await db.query(
    `INSERT INTO evidence_attachments (
      case_id,
      uploaded_by,
      evidence_tag_number,
      description,
      original_filename,
      file_type,
      file_size,
      file_path,
      file_key_encrypted,
      iv,
      file_sha256,
      status,
      reviewed_by,
      review_notes,
      reviewed_at,
      retention_expiration_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      caseId,
      uploadedBy,
      evidenceTagNumber,
      description,
      originalFilename,
      fileType,
      fileSize,
      filePath,
      fileKeyEncrypted,
      iv,
      fileSha256,
      status,
      reviewedBy,
      reviewNotes,
      reviewedAt,
      retentionExpirationDate,
    ]
  );

  return mapEvidenceRow(result.rows[0]);
}

export async function getEvidenceAttachmentById(id) {
  const result = await db.query('SELECT * FROM evidence_attachments WHERE id = $1', [id]);
  return mapEvidenceRow(result.rows[0]);
}

export async function getEvidenceAttachmentsByCaseId(caseId) {
  const result = await db.query('SELECT * FROM evidence_attachments WHERE case_id = $1 ORDER BY uploaded_at DESC', [caseId]);
  return result.rows.map(mapEvidenceRow);
}

export async function getAllEvidenceAttachments() {
  const result = await db.query('SELECT * FROM evidence_attachments ORDER BY uploaded_at DESC');
  return result.rows.map(mapEvidenceRow);
}

export async function updateEvidenceAttachment(id, updates) {
  const fields = [];
  const values = [];
  let index = 1;

  Object.entries(updates).forEach(([key, value]) => {
    const column = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    fields.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  });

  if (fields.length === 0) {
    return getEvidenceAttachmentById(id);
  }

  values.push(id);
  const result = await db.query(
    `UPDATE evidence_attachments SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  return mapEvidenceRow(result.rows[0]);
}

export async function deleteEvidenceAttachment(id) {
  const result = await db.query('DELETE FROM evidence_attachments WHERE id = $1 RETURNING *', [id]);
  return mapEvidenceRow(result.rows[0]);
}

export {
  createEvidenceAttachment,
  getEvidenceAttachmentById,
  getEvidenceAttachmentsByCaseId,
  getAllEvidenceAttachments,
  updateEvidenceAttachment,
  deleteEvidenceAttachment,
};
