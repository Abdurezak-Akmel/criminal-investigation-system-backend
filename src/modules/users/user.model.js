import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['submitter', 'referee'], default: 'submitter', required: true },
  fullName: { type: String, required: true },
  badgeNumber: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls if non-officers exist
  agencyDepartment: { type: String },
  contactPhone: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // Embedded OTP code directly inside the user profile
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  }
}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

export const User = mongoose.model('User', userSchema);