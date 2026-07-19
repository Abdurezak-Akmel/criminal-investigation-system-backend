import mongoose from 'mongoose';

const chainOfCustodySchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence',
      required: true,
      index: true,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['SUBMITTED', 'VIEWED', 'DOWNLOADED', 'DECRYPTED', 'STATUS_CHANGE'],
      required: true,
    },
    previousStatus: String,
    newStatus: String,
    reasonForAction: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: String,
    actionTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export default mongoose.models.ChainOfCustody || mongoose.model('ChainOfCustody', chainOfCustodySchema);
