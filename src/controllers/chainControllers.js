import {
  createChainOfCustodyEntry,
  getChainOfCustodyEntryById,
  getChainOfCustodyByEvidenceId,
  getAllChainOfCustodyEntries,
  updateChainOfCustodyEntry,
  deleteChainOfCustodyEntry,
} from '../../database/models/chainModels.js';

export async function createChainEntryController(req, res) {
  try {
    const {
      evidenceId,
      actionBy,
      actionType,
      previousStatus,
      newStatus,
      reasonForAction,
      ipAddress,
      userAgent,
    } = req.body;

    if (!evidenceId || !actionType || !reasonForAction || !ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'Evidence ID, action type, reason for action, and IP address are required',
      });
    }

    const entry = await createChainOfCustodyEntry({
      evidenceId,
      actionBy,
      actionType,
      previousStatus,
      newStatus,
      reasonForAction,
      ipAddress,
      userAgent,
    });

    return res.status(201).json({ success: true, message: 'Chain of custody entry created successfully', entry });
  } catch (error) {
    console.error('createChainEntryController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create chain of custody entry' });
  }
}

export async function getChainEntryByIdController(req, res) {
  try {
    const { id } = req.params;
    const entry = await getChainOfCustodyEntryById(id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Chain of custody entry not found' });
    }

    return res.json({ success: true, entry });
  } catch (error) {
    console.error('getChainEntryByIdController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chain of custody entry' });
  }
}

export async function getChainEntriesByEvidenceIdController(req, res) {
  try {
    const { evidenceId } = req.params;
    const entries = await getChainOfCustodyByEvidenceId(evidenceId);

    return res.json({ success: true, entries });
  } catch (error) {
    console.error('getChainEntriesByEvidenceIdController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chain of custody entries' });
  }
}

export async function getAllChainEntriesController(req, res) {
  try {
    const entries = await getAllChainOfCustodyEntries();
    return res.json({ success: true, entries });
  } catch (error) {
    console.error('getAllChainEntriesController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chain of custody entries' });
  }
}

export async function updateChainEntryController(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingEntry = await getChainOfCustodyEntryById(id);
    if (!existingEntry) {
      return res.status(404).json({ success: false, message: 'Chain of custody entry not found' });
    }

    const updatedEntry = await updateChainOfCustodyEntry(id, updates);
    return res.json({ success: true, message: 'Chain of custody entry updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('updateChainEntryController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update chain of custody entry' });
  }
}

export async function deleteChainEntryController(req, res) {
  try {
    const { id } = req.params;
    const existingEntry = await getChainOfCustodyEntryById(id);

    if (!existingEntry) {
      return res.status(404).json({ success: false, message: 'Chain of custody entry not found' });
    }

    const deletedEntry = await deleteChainOfCustodyEntry(id);
    return res.json({ success: true, message: 'Chain of custody entry deleted successfully', entry: deletedEntry });
  } catch (error) {
    console.error('deleteChainEntryController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete chain of custody entry' });
  }
}

export default {
  createChainEntryController,
  getChainEntryByIdController,
  getChainEntriesByEvidenceIdController,
  getAllChainEntriesController,
  updateChainEntryController,
  deleteChainEntryController,
};
