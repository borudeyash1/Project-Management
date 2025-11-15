import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailUsage extends Document {
  dateKey: string; // YYYY-MM-DD
  count: number;
  limit: number;
  createdAt: Date;
  updatedAt: Date;
}

const emailUsageSchema = new Schema<IEmailUsage>(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    limit: {
      type: Number,
      default: 300,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const EmailUsage = mongoose.model<IEmailUsage>('EmailUsage', emailUsageSchema);
