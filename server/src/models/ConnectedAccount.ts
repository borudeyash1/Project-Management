import mongoose, { Document, Schema } from 'mongoose';

export interface IConnectedAccount extends Document {
    userId: mongoose.Types.ObjectId;
    service: 'mail' | 'calendar' | 'vault' | 'slack' | 'github' | 'dropbox' | 'onedrive' | 'figma' | 'notion' | 'vercel' | 'spotify';
    provider: 'google' | 'microsoft' | 'slack' | 'github' | 'dropbox' | 'figma' | 'notion' | 'vercel' | 'spotify';

    // OAuth tokens
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;

    // Account details from provider
    providerAccountId: string;
    providerEmail: string;
    providerName: string;
    providerAvatar?: string;

    // Status
    isActive: boolean;
    isPrimary: boolean;
    lastSynced?: Date;

    // Service-specific settings
    settings?: {
        notion?: {
            defaultDatabaseId?: string;
            defaultDatabaseName?: string;
        };
        slack?: {
            defaultChannelId?: string;
            defaultChannelName?: string;
        };
        zendesk?: {
            subdomain?: string;
        };
        linear?: {
            // Placeholder for potential future settings
        };
    };

    // Metadata
    scopes: string[];
    createdAt: Date;
    updatedAt: Date;
}

const connectedAccountSchema = new Schema<IConnectedAccount>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    service: {
        type: String,
        enum: ['mail', 'calendar', 'vault', 'slack', 'github', 'dropbox', 'onedrive', 'figma', 'notion', 'vercel', 'spotify', 'jira', 'zendesk'],
        required: true,
        index: true
    },
    provider: {
        type: String,
        enum: ['google', 'microsoft', 'slack', 'github', 'dropbox', 'figma', 'notion', 'vercel', 'spotify', 'jira', 'zendesk'],
        required: true
    },

    // OAuth tokens (encrypted at rest)
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: false
    },
    expiresAt: {
        type: Date,
        required: false
    },

    // Provider account details
    providerAccountId: {
        type: String,
        required: true
    },
    providerEmail: {
        type: String,
        required: true
    },
    providerName: {
        type: String,
        required: true
    },
    providerAvatar: {
        type: String
    },

    // Status flags
    isActive: {
        type: Boolean,
        default: false
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    lastSynced: {
        type: Date
    },

    // Service-specific settings
    settings: {
        type: Schema.Types.Mixed,
        default: {}
    },

    // OAuth scopes
    scopes: [{
        type: String
    }]
}, {
    timestamps: true
});

// Compound indexes for efficient queries
connectedAccountSchema.index({ userId: 1, service: 1 });
connectedAccountSchema.index({ userId: 1, service: 1, isActive: 1 });
connectedAccountSchema.index({ providerAccountId: 1, provider: 1 });

// Ensure only one active account per user per service
connectedAccountSchema.pre('save', async function (next) {
    if (this.isActive && this.isModified('isActive')) {
        // Deactivate other accounts for this user/service
        await mongoose.model('ConnectedAccount').updateMany(
            {
                userId: this.userId,
                service: this.service,
                _id: { $ne: this._id }
            },
            { $set: { isActive: false } }
        );
    }
    next();
});

export const ConnectedAccount = mongoose.model<IConnectedAccount>('ConnectedAccount', connectedAccountSchema);
