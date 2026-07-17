import db from '../config/db.js';

function mapChainOfCustodyRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    evidenceId: row.evidence_id,
    actionBy: row.action_by,
    actionType: row.action_type,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    reasonForAction: row.reason_for_action,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    actionTimestamp: row.action_timestamp,
  };
}

export async function createChainOfCustodyEntry({
  evidenceId,
  actionBy = null,
  actionType,
  previousStatus = null,
  newStatus = null,
  reasonForAction,
  ipAddress,
  userAgent = null,
}) {
  const result = await db.query(
    `INSERT INTO chain_of_custody (
      evidence_id,
      action_by,
      action_type,
      previous_status,
      new_status,
      reason_for_action,
      ip_address,
      user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      evidenceId,
      actionBy,
      actionType,
      previousStatus,
      newStatus,
      reasonForAction,
      ipAddress,
      userAgent,
    ]
  );

  return mapChainOfCustodyRow(result.rows[0]);
}

export async function getChainOfCustodyEntryById(id) {
  const result = await db.query('SELECT * FROM chain_of_custody WHERE id = $1', [id]);
  return mapChainOfCustodyRow(result.rows[0]);
}

export async function getChainOfCustodyByEvidenceId(evidenceId) {
  const result = await db.query('SELECT * FROM chain_of_custody WHERE evidence_id = $1 ORDER BY action_timestamp DESC', [evidenceId]);
  return result.rows.map(mapChainOfCustodyRow);
}

export async function getAllChainOfCustodyEntries() {
  const result = await db.query('SELECT * FROM chain_of_custody ORDER BY action_timestamp DESC');
  return result.rows.map(mapChainOfCustodyRow);
}

export async function updateChainOfCustodyEntry(id, updates) {
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
    return getChainOfCustodyEntryById(id);
  }

  values.push(id);
  const result = await db.query(
    `UPDATE chain_of_custody SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  return mapChainOfCustodyRow(result.rows[0]);
}

export async function deleteChainOfCustodyEntry(id) {
  const result = await db.query('DELETE FROM chain_of_custody WHERE id = $1 RETURNING *', [id]);
  return mapChainOfCustodyRow(result.rows[0]);
}

export {
  createChainOfCustodyEntry,
  getChainOfCustodyEntryById,
  getChainOfCustodyByEvidenceId,
  getAllChainOfCustodyEntries,
  updateChainOfCustodyEntry,
  deleteChainOfCustodyEntry,
};
