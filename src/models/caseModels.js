import db from '../config/db.js';

function mapCaseRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    caseNumber: row.case_number,
    title: row.title,
    description: row.description,
    statuteOffense: row.statute_offense,
    incidentDate: row.incident_date,
    status: row.status,
    sensitivity: row.sensitivity,
    submittedBy: row.submitted_by,
    assignedInvestigator: row.assigned_investigator,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCase({
  caseNumber,
  title,
  description,
  statuteOffense = null,
  incidentDate,
  status = 'open',
  sensitivity = 'restricted',
  submittedBy = null,
  assignedInvestigator = null,
}) {
  const result = await db.query(
    `INSERT INTO cases (
      case_number,
      title,
      description,
      statute_offense,
      incident_date,
      status,
      sensitivity,
      submitted_by,
      assigned_investigator
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      caseNumber,
      title,
      description,
      statuteOffense,
      incidentDate,
      status,
      sensitivity,
      submittedBy,
      assignedInvestigator,
    ]
  );

  return mapCaseRow(result.rows[0]);
}

export async function getCaseById(id) {
  const result = await db.query('SELECT * FROM cases WHERE id = $1', [id]);
  return mapCaseRow(result.rows[0]);
}

export async function getCaseByCaseNumber(caseNumber) {
  const result = await db.query('SELECT * FROM cases WHERE case_number = $1', [caseNumber]);
  return mapCaseRow(result.rows[0]);
}

export async function getAllCases() {
  const result = await db.query('SELECT * FROM cases ORDER BY created_at DESC');
  return result.rows.map(mapCaseRow);
}

export async function updateCase(id, updates) {
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
    return getCaseById(id);
  }

  values.push(id);
  const result = await db.query(
    `UPDATE cases SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  return mapCaseRow(result.rows[0]);
}

export async function deleteCase(id) {
  const result = await db.query('DELETE FROM cases WHERE id = $1 RETURNING *', [id]);
  return mapCaseRow(result.rows[0]);
}

export {
  createCase,
  getCaseById,
  getCaseByCaseNumber,
  getAllCases,
  updateCase,
  deleteCase,
};
