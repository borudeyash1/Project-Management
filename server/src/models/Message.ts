import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  workspace: string;
  sender: string;
  recipient: string;
  content: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  workspace: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  recipient: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  readBy: [
    {
      type: String,
      ref: 'User',
    },
  ],
}, {
  timestamps: true,
});

messageSchema.index({ workspace: 1, sender: 1, recipient: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
