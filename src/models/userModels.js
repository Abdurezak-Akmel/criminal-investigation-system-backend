import db from '../config/db.js';

function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    fullName: row.full_name,
    badgeNumber: row.badge_number,
    agencyDepartment: row.agency_department,
    contactPhone: row.contact_phone,
    isActive: row.is_active,
    isVerified: row.is_verified,
    createdAt: row.created_at,
  };
}

export async function createUser({
  email,
  passwordHash,
  role = 'submitter',
  fullName,
  badgeNumber = null,
  agencyDepartment = null,
  contactPhone = null,
  isActive = true,
  isVerified = false,
}) {
  const result = await db.query(
    `INSERT INTO users (
      email,
      password_hash,
      role,
      full_name,
      badge_number,
      agency_department,
      contact_phone,
      is_active,
      is_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      email,
      passwordHash,
      role,
      fullName,
      badgeNumber,
      agencyDepartment,
      contactPhone,
      isActive,
      isVerified,
    ]
  );

  return mapUserRow(result.rows[0]);
}

export async function getUserById(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return mapUserRow(result.rows[0]);
}

export async function getUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return mapUserRow(result.rows[0]);
}

export async function getUserByBadgeNumber(badgeNumber) {
  const result = await db.query('SELECT * FROM users WHERE badge_number = $1', [badgeNumber]);
  return mapUserRow(result.rows[0]);
}

export async function updateUser(id, updates) {
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
    return getUserById(id);
  }

  values.push(id);
  const result = await db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  return mapUserRow(result.rows[0]);
}

export async function updateVerificationStatus(id, isVerified) {
  const result = await db.query('UPDATE users SET is_verified = $1 WHERE id = $2 RETURNING *', [isVerified, id]);
  return mapUserRow(result.rows[0]);
}

export async function setUserActiveStatus(id, isActive) {
  const result = await db.query('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *', [isActive, id]);
  return mapUserRow(result.rows[0]);
}

export {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByBadgeNumber,
  updateUser,
  updateVerificationStatus,
  setUserActiveStatus,
};
