import ChainOfCustody from './chain.model.js';

export function createChainEntry(payload) {
  return ChainOfCustody.create(payload);
}

export function getChainEntryById(id) {
  return ChainOfCustody.findById(id).populate('actionBy', 'email fullName role');
}

export function getChainByEvidenceId(evidenceId) {
  return ChainOfCustody.find({ evidenceId })
    .sort({ actionTimestamp: -1 })
    .populate('actionBy', 'email fullName role');
}

export function getChainEntries() {
  return ChainOfCustody.find()
    .sort({ actionTimestamp: -1 })
    .populate('actionBy caseId evidenceId', 'email fullName role caseNumber title originalFilename');
}
