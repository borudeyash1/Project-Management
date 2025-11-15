import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  teams: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'member'], 
    default: 'member' 
  },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An unknown error occurred while hashing password'));
    }
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
