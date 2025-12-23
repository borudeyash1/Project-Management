import { Router } from "express";
import {
  handleChatRequest,
  handleProjectCreation,
  handleMilestoneSuggestion,
  healthCheck,
  handleMeetingNotesProcessing,
} from "../controllers/aiController";
import {
  analyzeContext,
  askContextQuestion,
  suggestContextAction,
} from "../controllers/contextAIController";
import { authenticate as protect } from "../middleware/auth";
import { checkAICredits } from "../middleware/aiCredits";

const router = Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Handle AI chat requests
 * @access  Private (should be authenticated)
 */
router.post("/chat", handleChatRequest);

/**
 * @route   POST /api/ai/projects/create
 * @desc    Create project from natural language
 * @access  Private (should be authenticated)
 */
router.post("/projects/create", handleProjectCreation);

/**
 * @route   POST /api/ai/milestones/suggest
 * @desc    Suggest milestones and tasks for a project
 * @access  Private (should be authenticated)
 */
router.post("/milestones/suggest", handleMilestoneSuggestion);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Public
 */
router.get("/health", healthCheck);

/**
 * @route   POST /api/ai/meeting-notes
 * @desc    Process meeting transcript and extract structured information
 * @access  Private (should be authenticated)
 */
router.post("/meeting-notes", protect, checkAICredits('meeting_summary'), handleMeetingNotesProcessing);

/**
 * @route   POST /api/ai/analyze-context
 * @desc    Analyze current page context and provide AI insights
 * @access  Private
 */
router.post("/analyze-context", protect, checkAICredits('context_analysis'), analyzeContext);

/**
 * @route   POST /api/ai/ask-question
 * @desc    Ask a question in current page context
 * @access  Private
 */
router.post("/ask-question", protect, checkAICredits('context_question'), askContextQuestion);

/**
 * @route   POST /api/ai/suggest-action
 * @desc    Get smart action suggestions based on context
 * @access  Private
 */
router.post("/suggest-action", protect, checkAICredits('context_action'), suggestContextAction);

export default router;

