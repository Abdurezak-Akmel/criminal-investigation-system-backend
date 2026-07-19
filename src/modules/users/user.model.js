import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    code: String,
    expiresAt: Date,
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset', 'admin_invite'],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['submitter', 'referee', 'admin'],
      default: 'submitter',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    badgeNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    agencyDepartment: String,
    contactPhone: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: otpSchema,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
