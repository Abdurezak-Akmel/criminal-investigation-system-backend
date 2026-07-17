import db from '../config/db.js';

function mapOtpRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    code: row.code,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function createOtp({ userId, code, expiresAt }) {
  const result = await db.query(
    `INSERT INTO otp_codes (user_id, code, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, code, expiresAt]
  );

  return mapOtpRow(result.rows[0]);
}

export async function getOtpById(id) {
  const result = await db.query('SELECT * FROM otp_codes WHERE id = $1', [id]);
  return mapOtpRow(result.rows[0]);
}

export async function getOtpByUserId(userId) {
  const result = await db.query('SELECT * FROM otp_codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
  return mapOtpRow(result.rows[0]);
}

export async function updateOtp(id, updates) {
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
    return getOtpById(id);
  }

  values.push(id);
  const result = await db.query(
    `UPDATE otp_codes SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  return mapOtpRow(result.rows[0]);
}

export async function deleteOtp(id) {
  const result = await db.query('DELETE FROM otp_codes WHERE id = $1 RETURNING *', [id]);
  return mapOtpRow(result.rows[0]);
}

export async function deleteOtpByUserId(userId) {
  const result = await db.query('DELETE FROM otp_codes WHERE user_id = $1 RETURNING *', [userId]);
  return result.rows.map(mapOtpRow);
}

export {
  createOtp,
  getOtpById,
  getOtpByUserId,
  updateOtp,
  deleteOtp,
  deleteOtpByUserId,
};
