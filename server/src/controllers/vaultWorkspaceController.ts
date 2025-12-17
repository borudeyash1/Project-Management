import { Response } from 'express';
import VaultDocument from '../models/VaultDocument';
import Workspace from '../models/Workspace';
import User from '../models/User';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { uploadFile, addPermission } from '../services/driveService';

// Helper to format bytes
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Link vault folder to workspace
export const linkVaultToWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workspaceId, folderId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify workspace exists and user has permission
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.hasPermission(userId.toString(), 'canUpdateWorkspaceDetails')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        // Verify folder exists
        const folder = await VaultDocument.findById(folderId);
        if (!folder || folder.type !== 'folder') {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Link folder to workspace
        workspace.vaultFolderId = folderId;
        await workspace.save();

        // Update folder to be workspace-linked
        folder.workspaceId = new mongoose.Types.ObjectId(workspaceId);
        folder.permissions.visibility = 'workspace';
        await folder.save();

        return res.json({
            message: 'Vault folder linked to workspace successfully',
            workspace,
            folder
        });
    } catch (error: any) {
        console.error('Error linking vault to workspace:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unlink vault from workspace
export const unlinkVaultFromWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.hasPermission(userId.toString(), 'canUpdateWorkspaceDetails')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        // Remove link
        workspace.vaultFolderId = undefined;
        workspace.quickAccessDocs = [];
        await workspace.save();

        return res.json({ message: 'Vault unlinked from workspace successfully' });
    } catch (error: any) {
        console.error('Error unlinking vault from workspace:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get workspace documents
export const getWorkspaceDocuments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.isMember(userId.toString())) {
            return res.status(403).json({ message: 'Not a workspace member' });
        }

        // Get all documents linked to this workspace
        const documents = await VaultDocument.find({
            workspaceId: workspaceId
        })
            .populate('uploadedBy', 'name email avatar')
            .sort({ isPinned: -1, createdAt: -1 });

        return res.json({ documents });
    } catch (error: any) {
        console.error('Error fetching workspace documents:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Pin document to workspace
export const pinDocumentToWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { documentId, workspaceId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.isMember(userId.toString())) {
            return res.status(403).json({ message: 'Not a workspace member' });
        }

        const document = await VaultDocument.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Pin document
        document.isPinned = true;
        document.quickAccessEnabled = true;
        await document.save();

        // Add to workspace quick access
        if (!workspace.quickAccessDocs) {
            workspace.quickAccessDocs = [];
        }

        // Check if already pinned (convert to string for comparison)
        const isAlreadyPinned = workspace.quickAccessDocs.some(
            (id: any) => id.toString() === documentId
        );

        if (!isAlreadyPinned) {
            workspace.quickAccessDocs.push(documentId);
            await workspace.save();
        }

        return res.json({ message: 'Document pinned successfully', document });
    } catch (error: any) {
        console.error('Error pinning document:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unpin document from workspace
export const unpinDocumentFromWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { documentId, workspaceId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const document = await VaultDocument.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Unpin document
        document.isPinned = false;
        document.quickAccessEnabled = false;
        await document.save();

        // Remove from workspace quick access
        if (workspace.quickAccessDocs) {
            workspace.quickAccessDocs = workspace.quickAccessDocs.filter(
                (docId: any) => docId.toString() !== documentId
            );
            await workspace.save();
        }

        return res.json({ message: 'Document unpinned successfully' });
    } catch (error: any) {
        console.error('Error unpinning document:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Upload document to workspace vault
export const uploadDocumentToWorkspace = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?._id;
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.isMember(userId.toString())) {
            return res.status(403).json({ message: 'Not a workspace member' });
        }

        // Check if user has Vault connected
        const uploader = await User.findById(userId);
        if (!uploader?.modules?.vault?.isEnabled) {
            return res.status(400).json({ message: 'Please connect Sartthi Vault first' });
        }

        // Determine file type from mimetype
        let type = 'file';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype.startsWith('audio/')) type = 'audio';
        else if (file.mimetype === 'application/pdf' || file.mimetype.includes('document')) type = 'document';

        // 1. Upload to Google Drive
        const driveFile = await uploadFile(userId.toString(), file, workspace.vaultFolderId?.toString());

        // 2. Share with Workspace Members
        // Get all active members with emails
        const membersToShareWith = await Workspace.findById(workspaceId).populate('members.user', 'email');
        const allowedUsers: string[] = [];

        if (membersToShareWith && membersToShareWith.members) {
            // Process in parallel but handle errors gracefully
            await Promise.all(membersToShareWith.members.map(async (member: any) => {
                if (member.status === 'active' && member.user?.email && member.user._id.toString() !== userId.toString()) {
                    await addPermission(userId.toString(), driveFile.id!, member.user.email, 'reader');
                    allowedUsers.push(member.user._id.toString());
                }
            }));
        }

        // 3. Create Database Record
        const document = new VaultDocument({
            name: file.originalname,
            type,
            size: file.size,
            formattedSize: formatBytes(file.size),
            url: driveFile.webViewLink,
            thumbnailUrl: driveFile.thumbnailLink || null,
            driveId: driveFile.id, // Store Drive ID
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            uploadedBy: new mongoose.Types.ObjectId(userId as string),
            parentFolder: workspace.vaultFolderId,
            metadata: {
                mimetype: file.mimetype,
                originalName: file.originalname,
                driveLink: driveFile.webViewLink
            },
            permissions: {
                visibility: 'workspace',
                allowedUsers: allowedUsers
            }
        });

        await document.save();

        return res.status(201).json({
            message: 'Document uploaded and shared successfully',
            document
        });
    } catch (error: any) {
        console.error('Error uploading document:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Sync workspace vault
export const syncWorkspaceVault = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspace = await Workspace.findById(workspaceId)
            .populate('vaultFolderId')
            .populate('quickAccessDocs');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.isMember(userId.toString())) {
            return res.status(403).json({ message: 'Not a workspace member' });
        }

        // If no vault folder exists, create one
        if (!workspace.vaultFolderId) {
            const vaultFolder = new VaultDocument({
                name: `${workspace.name} - Documents`,
                type: 'folder',
                workspaceId: new mongoose.Types.ObjectId(workspaceId),
                uploadedBy: new mongoose.Types.ObjectId(workspace.owner),
                permissions: {
                    visibility: 'workspace',
                    allowedUsers: []
                }
            });

            await vaultFolder.save();
            workspace.vaultFolderId = vaultFolder._id as any;
            await workspace.save();
        }

        return res.json({
            message: 'Workspace vault synced successfully',
            vaultFolder: workspace.vaultFolderId,
            quickAccessDocs: workspace.quickAccessDocs
        });
    } catch (error: any) {
        console.error('Error syncing workspace vault:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
