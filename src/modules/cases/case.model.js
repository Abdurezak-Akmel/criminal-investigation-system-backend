import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema(
  {
    /*
    case: {
      caseNumber,
      title,
      description,
      statuteOffence,
      incidentDate,
      status,
      sensitivity,
      submitterdBy,
      assignedInvestigator
    }
    */
    caseNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    statuteOffense: String,
    incidentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'deferred', 'closed_resolved', 'closed_unresolved'],
      default: 'open',
    },
    sensitivity: {
      type: String,
      enum: ['public', 'restricted', 'confidential', 'highly_classified'],
      default: 'restricted',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedInvestigator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Case || mongoose.model('Case', caseSchema);
