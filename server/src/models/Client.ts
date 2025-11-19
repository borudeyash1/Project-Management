import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  status: 'active' | 'inactive';
  projectsCount?: number;
  totalRevenue?: number;
  notes?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  projectsCount: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  workspaceId: {
    type: String,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

clientSchema.index({ workspaceId: 1, name: 1 });

export default mongoose.model<IClient>('Client', clientSchema);
