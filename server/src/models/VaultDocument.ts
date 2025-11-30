import mongoose, { Schema, Document } from 'mongoose';

export interface IVaultDocument extends Document {
    _id: string;
    name: string;
    type: 'folder' | 'file' | 'image' | 'video' | 'audio' | 'document';
    size?: number;
    url?: string;
    thumbnailUrl?: string;
    workspaceId?: mongoose.Types.ObjectId;
    uploadedBy: mongoose.Types.ObjectId;
    isPinned: boolean;
    quickAccessEnabled: boolean;
    parentFolder?: mongoose.Types.ObjectId;
    tags: string[];
    metadata: {
        mimeType?: string;
        extension?: string;
        dimensions?: {
            width: number;
            height: number;
        };
        duration?: number;
    };
    permissions: {
        visibility: 'public' | 'workspace' | 'private';
        allowedUsers: mongoose.Types.ObjectId[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const vaultDocumentSchema = new Schema<IVaultDocument>({
    name: {
        type: String,
        required: [true, 'Document name is required'],
        trim: true,
        maxlength: [255, 'Name cannot exceed 255 characters']
    },
    type: {
        type: String,
        enum: ['folder', 'file', 'image', 'video', 'audio', 'document'],
        required: true
    },
    size: {
        type: Number,
        min: 0
    },
    url: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    workspaceId: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        index: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isPinned: {
        type: Boolean,
        default: false,
        index: true
    },
    quickAccessEnabled: {
        type: Boolean,
        default: false
    },
    parentFolder: {
        type: Schema.Types.ObjectId,
        ref: 'VaultDocument'
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        mimeType: String,
        extension: String,
        dimensions: {
            width: Number,
            height: Number
        },
        duration: Number
    },
    permissions: {
        visibility: {
            type: String,
            enum: ['public', 'workspace', 'private'],
            default: 'private'
        },
        allowedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }
}, {
    timestamps: true
});

// Indexes
vaultDocumentSchema.index({ workspaceId: 1, isPinned: 1 });
vaultDocumentSchema.index({ uploadedBy: 1, createdAt: -1 });
vaultDocumentSchema.index({ name: 'text', tags: 'text' });
vaultDocumentSchema.index({ type: 1 });

// Virtual for formatted size
vaultDocumentSchema.virtual('formattedSize').get(function () {
    if (!this.size) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
});

// Method to check if user has access
vaultDocumentSchema.methods.hasAccess = function (userId: string) {
    if (this.permissions.visibility === 'public') return true;
    if (this.uploadedBy.toString() === userId.toString()) return true;

    return this.permissions.allowedUsers.some(
        (allowedUser: any) => allowedUser.toString() === userId.toString()
    );
};

// Transform JSON output
vaultDocumentSchema.methods.toJSON = function () {
    const docObject = this.toObject();
    docObject.formattedSize = this.formattedSize;
    return docObject;
};

export default mongoose.model<IVaultDocument>('VaultDocument', vaultDocumentSchema);
