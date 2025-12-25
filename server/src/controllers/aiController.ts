import { Request, Response } from "express";
import aiService from "../services/aiService";
import deepSeekMeetingService from "../services/deepseek-meeting";

interface ChatRequest {
  message: string;
  userContext?: {
    profile?: any;
    projects?: any[];
    tasks?: any[];
    workspaces?: any[];
  };
  language?: string;
}

/**
 * Handle AI chat requests
 */
export const handleChatRequest = async (req: Request, res: Response) => {
  try {
    const { message, userContext, language }: ChatRequest = req.body;

    console.log('[AI Controller] Received language:', language);
    console.log('[AI Controller] Message:', message);

    // Validate input
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
    }

    // Get AI response
    const aiResponse = await aiService.getAIResponse(
      message,
      userContext || {},
      language
    );

    return res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error: any) {
    console.error("Error in handleChatRequest:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Handle project creation requests
 */
export const handleProjectCreation = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Project description is required",
      });
    }

    // Use AI service to create project
    const result = await aiService.getAIResponse(description, {});

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in handleProjectCreation:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the project",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Handle milestone and task suggestion requests
 */
export const handleMilestoneSuggestion = async (
  req: Request,
  res: Response,
) => {
  try {
    const { projectName, projectDescription } = req.body;

    if (!projectName || !projectDescription) {
      return res.status(400).json({
        success: false,
        message: "Project name and description are required",
      });
    }

    const message = `Suggest milestones and tasks for my project: ${projectName}. Description: ${projectDescription}`;
    const result = await aiService.getAIResponse(message, {});

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in handleMilestoneSuggestion:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating milestones",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const isConfigured = !!apiKey;

    return res.status(200).json({
      success: true,
      data: {
        status: "operational",
        aiConfigured: isConfigured,
        model: "DeepSeek V3",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "AI service health check failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Handle meeting summary generation (OPTIONAL - user must explicitly request)
 * This is NOT automatic - only triggered when user clicks "Generate AI Summary"
 */
export const handleMeetingNotesProcessing = async (
  req: Request,
  res: Response
) => {
  try {
    const { transcript } = req.body;

    // Validate input
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({
        success: false,
        message: "Transcript is required and must be a string",
      });
    }

    if (transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Transcript cannot be empty",
      });
    }

    // Check if this is a cached result (set by middleware)
    if (req.aiCredits?.cached && req.aiCredits.cachedResult) {
      console.log('[AI Controller] Serving cached meeting summary');
      return res.status(200).json({
        success: true,
        data: req.aiCredits.cachedResult,
        cached: true,
        creditsUsed: 0,
        message: 'Showing cached summary from earlier',
      });
    }

    // Process the transcript with AI
    const result = await deepSeekMeetingService.processMeetingTranscript(
      transcript
    );

    // Check if result is an error
    if ("error" in result) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    // Deduct credits and cache result (handled by middleware helper)
    const { deductAICredits } = await import('../middleware/aiCredits');
    const creditInfo = await deductAICredits(req, res, result);

    // Return successful result with credit info
    return res.status(200).json({
      success: true,
      data: result,
      cached: false,
      creditsUsed: 100, // meeting_summary cost
      creditsRemaining: creditInfo.newBalance,
      warning: creditInfo.warning,
    });
  } catch (error: any) {
    console.error("Error in handleMeetingNotesProcessing:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the meeting transcript",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

