import {
  createCase,
  getCaseById,
  getCaseByCaseNumber,
  getAllCases,
  updateCase,
  deleteCase,
} from '../models/caseModels.js';

export async function createCaseController(req, res) {
  try {
    const {
      caseNumber,
      title,
      description,
      statuteOffense,
      incidentDate,
      status,
      sensitivity,
      submittedBy,
      assignedInvestigator,
    } = req.body;

    if (!caseNumber || !title || !description || !incidentDate) {
      return res.status(400).json({ success: false, message: 'Case number, title, description, and incident date are required' });
    }

    const newCase = await createCase({
      caseNumber,
      title,
      description,
      statuteOffense,
      incidentDate,
      status,
      sensitivity,
      submittedBy,
      assignedInvestigator,
    });

    return res.status(201).json({ success: true, message: 'Case created successfully', case: newCase });
  } catch (error) {
    console.error('createCaseController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create case' });
  }
}

export async function getCaseByIdController(req, res) {
  try {
    const { id } = req.params;
    const caseRecord = await getCaseById(id);

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    return res.json({ success: true, case: caseRecord });
  } catch (error) {
    console.error('getCaseByIdController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch case' });
  }
}

export async function getCaseByCaseNumberController(req, res) {
  try {
    const { caseNumber } = req.params;
    const caseRecord = await getCaseByCaseNumber(caseNumber);

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    return res.json({ success: true, case: caseRecord });
  } catch (error) {
    console.error('getCaseByCaseNumberController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch case' });
  }
}

export async function getAllCasesController(req, res) {
  try {
    const cases = await getAllCases();
    return res.json({ success: true, cases });
  } catch (error) {
    console.error('getAllCasesController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cases' });
  }
}

export async function updateCaseController(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingCase = await getCaseById(id);
    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const updatedCase = await updateCase(id, updates);
    return res.json({ success: true, message: 'Case updated successfully', case: updatedCase });
  } catch (error) {
    console.error('updateCaseController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update case' });
  }
}

export async function deleteCaseController(req, res) {
  try {
    const { id } = req.params;
    const existingCase = await getCaseById(id);

    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const deletedCase = await deleteCase(id);
    return res.json({ success: true, message: 'Case deleted successfully', case: deletedCase });
  } catch (error) {
    console.error('deleteCaseController error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete case' });
  }
}

export default {
  createCaseController,
  getCaseByIdController,
  getCaseByCaseNumberController,
  getAllCasesController,
  updateCaseController,
  deleteCaseController,
};
