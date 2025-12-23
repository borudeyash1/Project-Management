import { Request, Response } from 'express';
import contextAnalyzerService, { PageType, WorkspaceSubPage, ProjectSubPage } from '../services/contextAnalyzerService';
import aiPromptTemplatesService from '../services/aiPromptTemplates';
import llmService from '../services/llmService';
import { deductAICredits } from '../middleware/aiCredits';

/**
 * Analyze current page context and provide AI insights
 * POST /api/ai/analyze-context
 */
export const analyzeContext = async (req: Request, res: Response) => {
    try {
        const { pageType, pageId, subPage, pageData } = req.body;
        const userId = (req.user as any)._id.toString();

        // Validate input
        if (!pageType || !pageId || !subPage) {
            return res.status(400).json({
                success: false,
                message: 'pageType, pageId, and subPage are required'
            });
        }

        // Check if cached (set by middleware)
        if (req.aiCredits?.cached && req.aiCredits.cachedResult) {
            console.log('[Context AI] Serving cached analysis');
            return res.status(200).json({
                success: true,
                data: req.aiCredits.cachedResult,
                cached: true,
                creditsUsed: 0,
                message: 'Showing cached analysis from earlier'
            });
        }

        // Analyze context
        let contextData;
        if (pageType === 'workspace') {
            contextData = await contextAnalyzerService.analyzeWorkspaceContext(
                pageId,
                subPage as WorkspaceSubPage,
                userId,
                pageData
            );
        } else if (pageType === 'project') {
            contextData = await contextAnalyzerService.analyzeProjectContext(
                pageId,
                subPage as ProjectSubPage,
                userId,
                pageData
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid pageType. Must be "workspace" or "project"'
            });
        }

        // Generate AI prompt
        const promptTemplate = aiPromptTemplatesService.generateContextPrompt(
            contextData.context,
            contextData.aggregatedData
        );

        // Call AI
        const aiResponse = await llmService.generateGeneralResponse(
            promptTemplate.userPrompt,
            promptTemplate.systemPrompt
        );

        // Get quick questions
        const quickQuestions = aiPromptTemplatesService.generateQuickQuestions(
            contextData.context
        );

        const result = {
            summary: aiResponse,
            focusAreas: promptTemplate.focusAreas,
            quickQuestions,
            context: contextData.context,
            tokenEstimate: contextData.tokenEstimate
        };

        // Deduct credits and cache result
        const creditInfo = await deductAICredits(req, res, result);

        return res.status(200).json({
            success: true,
            data: result,
            cached: false,
            creditsUsed: 15,
            creditsRemaining: creditInfo.newBalance,
            warning: creditInfo.warning
        });

    } catch (error: any) {
        console.error('[Context AI] Error in analyzeContext:', error);
        return res.status(500).json({
            success: false,
            message: 'Error analyzing context',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Ask a question in current context
 * POST /api/ai/ask-question
 */
export const askContextQuestion = async (req: Request, res: Response) => {
    try {
        const { question, pageType, pageId, subPage, pageData } = req.body;
        const userId = (req.user as any)._id.toString();

        // Validate input
        if (!question || !pageType || !pageId || !subPage) {
            return res.status(400).json({
                success: false,
                message: 'question, pageType, pageId, and subPage are required'
            });
        }

        // Check if cached
        if (req.aiCredits?.cached && req.aiCredits.cachedResult) {
            console.log('[Context AI] Serving cached answer');
            return res.status(200).json({
                success: true,
                data: req.aiCredits.cachedResult,
                cached: true,
                creditsUsed: 0,
                message: 'Showing cached answer from earlier'
            });
        }

        // Analyze context
        let contextData;
        if (pageType === 'workspace') {
            contextData = await contextAnalyzerService.analyzeWorkspaceContext(
                pageId,
                subPage as WorkspaceSubPage,
                userId,
                pageData
            );
        } else {
            contextData = await contextAnalyzerService.analyzeProjectContext(
                pageId,
                subPage as ProjectSubPage,
                userId,
                pageData
            );
        }

        // Generate contextual prompt
        const systemPrompt = `You are an AI assistant helping with ${pageType} management. Answer questions based on the current page context. Be concise and actionable.`;

        const userPrompt = `
Context: ${pageType} ${subPage} page
Role: ${contextData.context.userRole}
Data: ${JSON.stringify(contextData.aggregatedData)}

Question: ${question}

Provide a clear, concise answer based on the context above.
`;

        // Call AI
        const aiResponse = await llmService.generateGeneralResponse(
            userPrompt,
            systemPrompt
        );

        const result = {
            question,
            answer: aiResponse,
            context: contextData.context
        };

        // Deduct credits and cache
        const creditInfo = await deductAICredits(req, res, result);

        return res.status(200).json({
            success: true,
            data: result,
            cached: false,
            creditsUsed: 10,
            creditsRemaining: creditInfo.newBalance,
            warning: creditInfo.warning
        });

    } catch (error: any) {
        console.error('[Context AI] Error in askContextQuestion:', error);
        return res.status(500).json({
            success: false,
            message: 'Error answering question',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get smart action suggestions based on context
 * POST /api/ai/suggest-action
 */
export const suggestContextAction = async (req: Request, res: Response) => {
    try {
        const { pageType, pageId, subPage, pageData } = req.body;
        const userId = (req.user as any)._id.toString();

        // Validate input
        if (!pageType || !pageId || !subPage) {
            return res.status(400).json({
                success: false,
                message: 'pageType, pageId, and subPage are required'
            });
        }

        // Check if cached
        if (req.aiCredits?.cached && req.aiCredits.cachedResult) {
            console.log('[Context AI] Serving cached actions');
            return res.status(200).json({
                success: true,
                data: req.aiCredits.cachedResult,
                cached: true,
                creditsUsed: 0,
                message: 'Showing cached actions from earlier'
            });
        }

        // Analyze context
        let contextData;
        if (pageType === 'workspace') {
            contextData = await contextAnalyzerService.analyzeWorkspaceContext(
                pageId,
                subPage as WorkspaceSubPage,
                userId,
                pageData
            );
        } else {
            contextData = await contextAnalyzerService.analyzeProjectContext(
                pageId,
                subPage as ProjectSubPage,
                userId,
                pageData
            );
        }

        // Generate action-focused prompt
        const systemPrompt = `You are an AI assistant providing actionable recommendations. Focus on specific, implementable actions.`;

        const userPrompt = `
Context: ${pageType} ${subPage} page
Role: ${contextData.context.userRole}
Data: ${JSON.stringify(contextData.aggregatedData)}

Suggest 3-5 specific, actionable recommendations for this ${contextData.context.userRole}.
Format as a numbered list with clear action items.
`;

        // Call AI
        const aiResponse = await llmService.generateGeneralResponse(
            userPrompt,
            systemPrompt
        );

        const result = {
            actions: aiResponse,
            context: contextData.context
        };

        // Deduct credits and cache
        const creditInfo = await deductAICredits(req, res, result);

        return res.status(200).json({
            success: true,
            data: result,
            cached: false,
            creditsUsed: 10,
            creditsRemaining: creditInfo.newBalance,
            warning: creditInfo.warning
        });

    } catch (error: any) {
        console.error('[Context AI] Error in suggestContextAction:', error);
        return res.status(500).json({
            success: false,
            message: 'Error suggesting actions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
