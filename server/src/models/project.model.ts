import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  manager: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  progress: number;
  budget?: number;
  client?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  budget: {
    type: Number,
    min: 0
  },
  client: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
