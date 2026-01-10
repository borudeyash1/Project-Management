import mongoose, { Schema, Document } from 'mongoose';
import { IExpense } from '../types';

const expenseSchema = new Schema<IExpense>({
    project: {
        type: String,
        required: [true, 'Project is required'],
        ref: 'Project'
    },
    workspace: {
        type: String,
        required: [true, 'Workspace is required'],
        ref: 'Workspace'
    },
    title: {
        type: String,
        required: [true, 'Expense title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true
    },
    category: {
        type: String,
        enum: ['Labor', 'Materials', 'Equipment', 'Software', 'Travel', 'Marketing', 'Utilities', 'Other'],
        required: [true, 'Category is required']
    },
    date: {
        type: Date,
        required: [true, 'Expense date is required'],
        default: Date.now
    },
    createdBy: {
        type: String,
        required: true,
        ref: 'User'
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: String,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectedBy: {
        type: String,
        ref: 'User'
    },
    rejectedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
expenseSchema.index({ project: 1, date: -1 });
expenseSchema.index({ workspace: 1, date: -1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdBy: 1 });

// Method to approve expense
expenseSchema.methods.approve = async function (approverId: string) {
    this.status = 'approved';
    this.approvedBy = approverId;
    this.approvedAt = new Date();
    return this.save();
};

// Method to reject expense
expenseSchema.methods.reject = async function (rejecterId: string, reason?: string) {
    this.status = 'rejected';
    this.rejectedBy = rejecterId;
    this.rejectedAt = new Date();
    if (reason) {
        this.rejectionReason = reason;
    }
    return this.save();
};

// Transform JSON output
expenseSchema.methods.toJSON = function () {
    const expenseObject = this.toObject();
    return expenseObject;
};

export default mongoose.model<IExpense>('Expense', expenseSchema);
