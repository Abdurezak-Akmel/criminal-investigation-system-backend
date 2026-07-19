import mongoose from 'mongoose';

const chainOfCustodySchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  evidenceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, 
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  actionType: { 
    type: String, 
    enum: ['SUBMITTED', 'VIEWED', 'DOWNLOADED', 'DECRYPTED', 'STATUS_CHANGE'], 
    required: true 
  },
  previousStatus: { type: String },
  newStatus: { type: String },
  reasonForAction: { type: String, required: true }, // Legal protection: must explain access reason
  
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  actionTimestamp: { type: Date, default: Date.now }
}, {
  caps: { size: 1024 * 1024 * 500, max: 1000000 } // Optional: Can set up as immutable capped collection
});

export const ChainOfCustody = mongoose.model('ChainOfCustody', chainOfCustodySchema);