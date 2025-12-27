import { Request, Response } from 'express';
import FigmaFile from '../models/FigmaFile';
import figmaService from '../services/figmaService';
import User from '../models/User';

/**
 * Get Figma token for user
 */
const getFigmaToken = async (userId: string): Promise<string | null> => {
    try {
        console.log('[FIGMA TOKEN] Fetching token for user:', userId);
        const user = await User.findById(userId).populate('connectedAccounts.figma.accounts');

        console.log('[FIGMA TOKEN] User found:', !!user);
        console.log('[FIGMA TOKEN] Connected accounts:', JSON.stringify(user?.connectedAccounts, null, 2));

        const figmaAccount = user?.connectedAccounts?.figma;
        console.log('[FIGMA TOKEN] Figma account:', JSON.stringify(figmaAccount, null, 2));

        if (!figmaAccount?.activeAccountId) {
            console.log('[FIGMA TOKEN] No active account ID found');
            return null;
        }

        // Accounts are populated ConnectedAccount objects
        const activeAccount = (figmaAccount.accounts as any[])?.find(
            (acc: any) => acc._id?.toString() === figmaAccount.activeAccountId?.toString()
        );

        console.log('[FIGMA TOKEN] Active account found:', !!activeAccount);
        console.log('[FIGMA TOKEN] Has access token:', !!activeAccount?.accessToken);

        return activeAccount?.accessToken || null;
    } catch (error) {
        console.error('[FIGMA TOKEN] Error getting Figma token:', error);
        return null;
    }
};

/**
 * Get workspace design library
 */
export const getWorkspaceDesigns = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = (req as any).user._id;

        const designs = await FigmaFile.find({
            workspaceId,
            category: { $in: ['brand', 'template'] }
        }).sort({ createdAt: -1 });

        res.json({ designs });
    } catch (error: any) {
        console.error('Get workspace designs error:', error);
        res.status(500).json({ message: 'Failed to fetch workspace designs' });
    }
};

/**
 * Get project designs
 */
export const getProjectDesigns = async (req: Request, res: Response) => {
    try {
        const { workspaceId, projectId } = req.params;

        const designs = await FigmaFile.find({
            workspaceId,
            projectId
        }).sort({ createdAt: -1 });

        res.json({ designs });
    } catch (error: any) {
        console.error('Get project designs error:', error);
        res.status(500).json({ message: 'Failed to fetch project designs' });
    }
};

/**
 * Get client designs
 */
export const getClientDesigns = async (req: Request, res: Response) => {
    try {
        const { workspaceId, clientId } = req.params;

        const designs = await FigmaFile.find({
            workspaceId,
            clientId,
            visibility: { $in: ['client', 'workspace'] }
        }).sort({ createdAt: -1 });

        res.json({ designs });
    } catch (error: any) {
        console.error('Get client designs error:', error);
        res.status(500).json({ message: 'Failed to fetch client designs' });
    }
};

/**
 * Upload/sync Figma file
 */
export const uploadFigmaFile = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { fileId, projectId, clientId, category, visibility } = req.body;
        const userId = (req as any).user._id;

        // Get Figma token
        const token = await getFigmaToken(userId);
        if (!token) {
            res.status(401).json({ message: 'Figma not connected' });
            return;
        }

        // Sync file to database
        const figmaFile = await figmaService.syncFileToDatabase(
            fileId,
            workspaceId as string,
            userId,
            token,
            { projectId, clientId, category, visibility }
        );

        res.json({ design: figmaFile });
    } catch (error: any) {
        console.error('Upload Figma file error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload Figma file' });
    }
};

/**
 * Update design status
 */
export const updateDesignStatus = async (req: Request, res: Response) => {
    try {
        const { designId } = req.params;
        const { status } = req.body;

        const design = await FigmaFile.findByIdAndUpdate(
            designId,
            { status },
            { new: true }
        );

        if (!design) {
            res.status(404).json({ message: 'Design not found' });
            return;
        }

        res.json({ design });
    } catch (error: any) {
        console.error('Update design status error:', error);
        res.status(500).json({ message: 'Failed to update design status' });
    }
};

/**
 * Add approval to design
 */
export const approveDesign = async (req: Request, res: Response) => {
    try {
        const { designId, frameId } = req.params;
        const { status, comment, role } = req.body;
        const userId = (req as any).user._id;
        const userName = (req as any).user.name;

        const design = await FigmaFile.findById(designId);
        if (!design) {
            res.status(404).json({ message: 'Design not found' });
            return;
        }

        // Find frame and add approval
        const frame = design.frames.find(f => f.frameId === frameId);
        if (frame) {
            frame.approvals.push({
                userId,
                userName,
                role: role || 'team',
                status,
                comment,
                timestamp: new Date()
            });
        }

        // Update design status based on approvals
        if (status === 'approved' && role === 'client') {
            design.status = 'approved';
        } else if (status === 'rejected') {
            design.status = 'rejected';
        }

        await design.save();

        res.json({ design });
    } catch (error: any) {
        console.error('Approve design error:', error);
        res.status(500).json({ message: 'Failed to approve design' });
    }
};

/**
 * Add comment to design frame
 */
export const addComment = async (req: Request, res: Response) => {
    try {
        const { designId, frameId } = req.params;
        const { comment } = req.body;
        const userId = (req as any).user._id;
        const userName = (req as any).user.name;

        const design = await FigmaFile.findById(designId);
        if (!design) {
            res.status(404).json({ message: 'Design not found' });
            return;
        }

        // Find frame and add comment
        const frame = design.frames.find(f => f.frameId === frameId);
        if (frame) {
            frame.comments.push({
                userId,
                userName,
                comment,
                timestamp: new Date()
            });
        }

        await design.save();

        res.json({ design });
    } catch (error: any) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

/**
 * Get pending approvals for workspace
 */
export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;

        const designs = await FigmaFile.find({
            workspaceId,
            status: { $in: ['review', 'client-review'] }
        }).sort({ updatedAt: -1 });

        res.json({ designs });
    } catch (error: any) {
        console.error('Get pending approvals error:', error);
        res.status(500).json({ message: 'Failed to fetch pending approvals' });
    }
};

/**
 * Delete design
 */
export const deleteDesign = async (req: Request, res: Response) => {
    try {
        const { designId } = req.params;

        await FigmaFile.findByIdAndDelete(designId);

        res.json({ message: 'Design deleted successfully' });
    } catch (error: any) {
        console.error('Delete design error:', error);
        res.status(500).json({ message: 'Failed to delete design' });
    }
};
