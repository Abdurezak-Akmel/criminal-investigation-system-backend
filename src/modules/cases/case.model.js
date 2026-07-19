import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  evidenceTagNumber: { type: String, unique: true, required: true },
  description: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // File Metadata
  originalFilename: { type: String, required: true },
  fileType: { type: String, required: true }, // e.g. 'application/pdf'
  fileSize: { type: Number, required: true }, // In bytes
  
  // Storage & Crypto-Integrity
  filePath: { type: String, required: true },
  fileKeyEncrypted: { type: String, required: true },
  iv: { type: String, required: true },
  fileSha256: { type: String, required: true }, // Critical for court integrity checks
  
  // Review Lifecycle
  status: { 
    type: String, 
    enum: ['submitted', 'accepted_in_evidence', 'rejected', 'sent_to_forensics', 'disposed'], 
    default: 'submitted' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  reviewedAt: { type: Date },
  retentionExpirationDate: { type: Date }
}, {
  timestamps: { createdAt: 'uploadedAt', updatedAt: false }
});

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, unique: true, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  statuteOffense: { type: String }, // e.g., "Penal Code 211"
  incidentDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['open', 'under_review', 'deferred', 'closed_resolved', 'closed_unresolved'], 
    default: 'open' 
  },
  sensitivity: { 
    type: String, 
    enum: ['public', 'restricted', 'confidential', 'highly_classified'], 
    default: 'restricted' 
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedInvestigator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  
  // Embedded Evidence Attachments Array
  evidence: [evidenceSchema]
}, { 
  timestamps: true 
});

// Composite Indexing for lightning-fast queries on file integrity verification
caseSchema.index({ "evidence.fileSha256": 1 });

export const Case = mongoose.model('Case', caseSchema);