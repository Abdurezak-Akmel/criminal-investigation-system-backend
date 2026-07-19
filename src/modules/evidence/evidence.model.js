import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    evidenceTagNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: String,
    originalFilename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileKeyEncrypted: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    fileSha256: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'accepted_in_evidence', 'rejected', 'sent_to_forensics', 'disposed'],
      default: 'submitted',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: String,
    reviewedAt: Date,
    retentionExpirationDate: Date,
  },
  {
    timestamps: {
      createdAt: 'uploadedAt',
      updatedAt: true,
    },
  }
);

export default mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema);
