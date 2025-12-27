import { Request, Response } from 'express';
import { getNotionService } from '../../services/sartthi/notionService';

const notionService = getNotionService();

export const searchNotion = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { query } = req.body;

        // We can optionally pass accountId if we support multi-account in the future
        // For now, it defaults to the active account in the service
        const results = await notionService.search(userId, query);

        res.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Notion search controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to search Notion'
        });
    }
};

export const createNotionPage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { title, content, properties, parentDatabase, parentPage } = req.body;

        if (!title) {
            res.status(400).json({
                success: false,
                message: 'Title is required'
            });
            return;
        }

        const result = await notionService.createPage(userId, {
            title,
            content: content || [],
            properties,
            parentDatabase,
            parentPage
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Notion create page controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create Notion page'
        });
    }
};

export const updateNotionPage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { pageId } = req.params;
        const { properties, archived } = req.body;

        if (!pageId) {
            res.status(400).json({
                success: false,
                message: 'Page ID is required'
            });
            return;
        }

        const result = await notionService.updatePage(userId, pageId, {
            properties,
            archived
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Notion update page controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update Notion page'
        });
    }
};

export const appendNotionBlocks = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { blockId } = req.params;
        const { children } = req.body;

        if (!blockId || !children) {
            res.status(400).json({
                success: false,
                message: 'Block ID and children are required'
            });
            return;
        }

        const result = await notionService.appendBlockChildren(userId, blockId, children);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Notion append blocks controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to append blocks to Notion page'
        });
    }
};

export const createNotionDatabase = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { title, properties, parentPage } = req.body;

        if (!title || !properties) {
            res.status(400).json({
                success: false,
                message: 'Title and properties are required'
            });
            return;
        }

        const result = await notionService.createDatabase(userId, {
            title,
            properties,
            parentPage
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Notion create database controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create Notion database'
        });
    }
};

export const listNotionDatabases = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        const databases = await notionService.listDatabases(userId);

        res.json({
            success: true,
            data: databases
        });
    } catch (error: any) {
        console.error('Notion list databases controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to list Notion databases'
        });
    }
};

export const setDefaultDatabase = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { databaseId, databaseName } = req.body;

        if (!databaseId) {
            res.status(400).json({
                success: false,
                message: 'Database ID is required'
            });
            return;
        }

        // Import ConnectedAccount model
        const { ConnectedAccount } = require('../../models/ConnectedAccount');

        // Find the active Notion account
        const account = await ConnectedAccount.findOne({
            userId,
            service: 'notion',
            isActive: true
        });

        if (!account) {
            res.status(404).json({
                success: false,
                message: 'No active Notion account found'
            });
            return;
        }

        // Update settings
        if (!account.settings) account.settings = {};
        if (!account.settings.notion) account.settings.notion = {};

        account.settings.notion.defaultDatabaseId = databaseId;
        account.settings.notion.defaultDatabaseName = databaseName;

        await account.save();

        res.json({
            success: true,
            message: 'Default database set successfully',
            data: {
                databaseId,
                databaseName
            }
        });
    } catch (error: any) {
        console.error('Set default database error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to set default database'
        });
    }
};
