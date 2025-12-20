import { Router } from "express";
import {
  handleChatRequest,
  handleProjectCreation,
  handleMilestoneSuggestion,
  healthCheck,
  handleMeetingNotesProcessing,
} from "../controllers/aiController";
import { authenticate as protect } from "../middleware/auth";

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
router.post("/meeting-notes", protect, handleMeetingNotesProcessing);

export default router;
