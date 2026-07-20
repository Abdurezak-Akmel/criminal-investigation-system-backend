import mongoose from 'mongoose';

// Definition of the User schema
const userSchema = new mongoose.Schema(
  {
    // userInfo: { 
      // email, 
      // passwordHash, 
      // role, 
      // fullName, 
      // badgeNumber, 
      // agencyDepartment, 
      // contactPhone, 
      // isActive, 
      // isVerified 
    // }
    
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
      required: true,
    },
    agencyDepartment: String,
    contactPhone: String,
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
