import Case from './case.model.js';

export function createCase(payload, userId) {
  return Case.create({
    ...payload,
    submittedBy: payload.submittedBy || userId,
  });
}

export function getCaseById(id) {
  return Case.findById(id).populate('submittedBy assignedInvestigator', 'email fullName role');
}

export function getCaseByCaseNumber(caseNumber) {
  return Case.findOne({ caseNumber }).populate('submittedBy assignedInvestigator', 'email fullName role');
}

export function getCases() {
  return Case.find().sort({ createdAt: -1 }).populate('submittedBy assignedInvestigator', 'email fullName role');
}

export function updateCase(id, updates) {
  return Case.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

export function deleteCase(id) {
  return Case.findByIdAndDelete(id);
}
