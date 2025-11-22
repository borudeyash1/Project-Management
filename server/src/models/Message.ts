import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  workspace: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, {
  timestamps: true,
});

messageSchema.index({ workspace: 1, sender: 1, recipient: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
