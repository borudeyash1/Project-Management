import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  googleId?: string;
  avatar?: string;
  lastLogin?: Date;
  loginMethod: 'email' | 'google' | 'both';
  loginOtp?: string;
  loginOtpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  loginMethod: {
    type: String,
    enum: ['email', 'google', 'both'],
    required: true
  },
  loginOtp: {
    type: String,
    select: false
  },
  loginOtpExpiry: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Index for faster queries
adminSchema.index({ email: 1, isActive: 1 });
adminSchema.index({ googleId: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
