# AI Chatbot Setup Guide

This guide will help you set up and configure the enhanced AI chatbot with intelligent project creation and task suggestion capabilities.

## Overview

The AI chatbot has been upgraded with the following capabilities:

1. **Smart Project Creation**: Create projects from natural language descriptions
2. **Intelligent Task Suggestion**: Generate milestones and tasks for projects
3. **Information Retrieval**: Get pending tasks, deadlines, and project status
4. **Intent Recognition**: Automatically understand user requests and route them appropriately

## Architecture

The enhanced chatbot uses a three-tier architecture:

```
Frontend (React) 
    ↓
Backend API (Node.js/Express)
    ↓
LLM Service (Google Gemini API)
```

### Components

- **Frontend**: `client/src/components/AIChatbot.tsx` - Chat UI
- **Frontend Service**: `client/src/services/aiService.ts` - API communication
- **Backend Routes**: `server/src/routes/ai.ts` - API endpoints
- **Backend Controller**: `server/src/controllers/aiController.ts` - Request handling
- **AI Service**: `server/src/services/aiService.ts` - Intent recognition & routing
- **LLM Service**: `server/src/services/llmService.ts` - Gemini API integration

## Prerequisites

1. Node.js (v16 or higher)
2. MongoDB (running)
3. Google Gemini API Key (free tier available)

## Setup Instructions

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

**Note**: The free tier provides:
- 60 requests per minute
- 1,500 requests per day
- Sufficient for development and small deployments

### Step 2: Configure Backend

1. Navigate to the server directory:
   ```bash
   cd "D:\YASH\Project Management\server"
   ```

2. Create or update your `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your-actual-api-key-here
   ```

4. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

### Step 3: Configure Frontend

1. Navigate to the client directory:
   ```bash
   cd "D:\YASH\Project Management\client"
   ```

2. Create or update your `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

### Step 4: Start the Application

1. Start the backend server:
   ```bash
   cd "D:\YASH\Project Management\server"
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd "D:\YASH\Project Management\client"
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

### Step 5: Verify Installation

1. Click the chatbot button in the bottom-right corner
2. Check the AI service health:
   ```bash
   curl http://localhost:5000/api/ai/health
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "status": "operational",
       "aiConfigured": true,
       "timestamp": "2024-01-01T00:00:00.000Z"
     }
   }
   ```

## Features & Usage

### 1. Smart Project Creation

**User Input:**
```
Create a mobile app project to launch by December
```

**AI Response:**
```
Okay, I've drafted a project for you:

**Project Name:** Mobile App Launch
**Description:** Launch a new mobile application to market...
**Type:** Product Launch
**Category:** Mobile
**Priority:** High

Does this look right? Would you like me to suggest milestones and tasks?
```

### 2. Intelligent Task Suggestion

**User Input:**
```
Suggest milestones for my new website project
```

**AI Response:**
```
Here are some suggested milestones and tasks:

**1. Phase 1: Planning & Design**
   • Define website requirements and features
   • Create wireframes and mockups
   • Develop content strategy

**2. Phase 2: Development**
   • Set up development environment
   • Implement frontend components
   • Develop backend API
   ...
```

### 3. Information Retrieval

**Available Commands:**
- "What are my pending tasks?"
- "Show me overdue deadlines"
- "What projects am I working on?"
- "Help me prioritize my tasks"

### 4. General Queries

The chatbot can also handle general project management questions:
- "How do I improve my productivity?"
- "What's the best way to manage remote teams?"
- "Help me create a project timeline"

## API Endpoints

### POST /api/ai/chat
Main chat endpoint for all AI interactions.

**Request:**
```json
{
  "message": "Create a marketing project",
  "userContext": {
    "profile": { "fullName": "John Doe" },
    "projects": [...],
    "tasks": [...],
    "workspaces": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "AI response text...",
    "suggestions": ["Suggestion 1", "Suggestion 2"],
    "data": { "projectDetails": {...} }
  }
}
```

### POST /api/ai/projects/create
Create a project from natural language.

**Request:**
```json
{
  "description": "I need a marketing project for Q1"
}
```

### POST /api/ai/milestones/suggest
Generate milestones and tasks.

**Request:**
```json
{
  "projectName": "Mobile App Launch",
  "projectDescription": "Launch a new mobile app..."
}
```

### GET /api/ai/health
Check AI service health and configuration.

## Intent Recognition

The AI automatically recognizes the following intents:

1. **CREATE_PROJECT**: User wants to create a new project
   - Keywords: "create project", "new project", "start project"
   
2. **SUGGEST_MILESTONES_TASKS**: User wants task suggestions
   - Keywords: "suggest tasks", "milestones", "what tasks"
   
3. **GET_PENDING_TASKS**: User wants to see pending tasks
   - Keywords: "pending tasks", "my tasks", "todo"
   
4. **GET_MISSING_DEADLINES**: User wants to see overdue items
   - Keywords: "overdue", "missing deadlines", "late tasks"
   
5. **GET_WORKING_PROJECTS**: User wants to see active projects
   - Keywords: "my projects", "current projects", "working on"
   
6. **GENERAL_QUERY**: General conversation or questions
   
7. **UNKNOWN**: Intent could not be determined

## Troubleshooting

### Issue: "Gemini API key is not configured"

**Solution:**
1. Verify `.env` file exists in `server/` directory
2. Check that `GEMINI_API_KEY` is set correctly
3. Restart the backend server

### Issue: "Cannot connect to AI service"

**Solution:**
1. Ensure backend server is running on port 5000
2. Check CORS configuration in `server/src/server.ts`
3. Verify `VITE_API_URL` in client `.env`

### Issue: "Request timeout"

**Solution:**
1. Check your internet connection
2. Verify Gemini API quota hasn't been exceeded
3. Increase timeout in `aiService.ts` if needed

### Issue: "Invalid JSON response from AI"

**Solution:**
1. The AI occasionally returns non-JSON responses
2. The system automatically handles this with fallbacks
3. If persistent, check Gemini API status

## Rate Limits & Quotas

### Free Tier Limits:
- **Requests per minute**: 60
- **Requests per day**: 1,500
- **Tokens per request**: 30,000 input, 2,048 output

### Best Practices:
1. Implement caching for repeated queries
2. Use debouncing for user input
3. Monitor usage in Google AI Studio dashboard
4. Consider upgrading for production use

## Security Considerations

1. **API Key Protection**:
   - Never commit `.env` files to version control
   - Store API keys securely on the server
   - Use environment variables for all sensitive data

2. **Input Validation**:
   - All user inputs are sanitized before processing
   - Request size limits are enforced
   - Rate limiting is applied to prevent abuse

3. **Authentication**:
   - Add authentication middleware to `/api/ai/*` routes
   - Verify user permissions before processing requests
   - Log all AI interactions for audit purposes

## Customization

### Modify Project Schema

Edit `server/src/services/llmService.ts`:

```typescript
// Update the JSON schema in generateProjectFromNaturalLanguage
const prompt = `
JSON Schema:
{
    "projectName": "string",
    "projectDescription": "string",
    "projectType": "string",
    "projectCategory": "string",
    "priorityLevel": "string",
    "customField": "string"  // Add your custom fields
}
`;
```

### Adjust AI Temperature

Control creativity vs. consistency:

```typescript
// In llmService.ts
generationConfig: {
  temperature: 0.7,  // 0.0 = deterministic, 1.0 = creative
  topK: 40,
  topP: 0.95,
}
```

### Add New Intents

1. Add intent to `recognizeIntent` method in `llmService.ts`
2. Create handler in `aiService.ts`
3. Add routing logic in `getAIResponse` switch statement

## Performance Optimization

1. **Caching**:
   ```typescript
   // Add Redis or in-memory cache for common queries
   const cache = new Map();
   ```

2. **Batch Processing**:
   ```typescript
   // Process multiple requests together
   await Promise.all(requests.map(req => llmService.process(req)));
   ```

3. **Lazy Loading**:
   - Only load AI service when chatbot is opened
   - Defer heavy computations

## Testing

### Test AI Service Health:
```bash
curl http://localhost:5000/api/ai/health
```

### Test Project Creation:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a marketing project for Q1",
    "userContext": {}
  }'
```

### Test Milestone Suggestion:
```bash
curl -X POST http://localhost:5000/api/ai/milestones/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Website Redesign",
    "projectDescription": "Complete redesign of company website"
  }'
```

## Monitoring & Analytics

### Track AI Usage:
1. Log all AI requests to database
2. Monitor response times
3. Track intent recognition accuracy
4. Measure user satisfaction

### Metrics to Monitor:
- API response time
- Error rate
- Intent recognition accuracy
- User engagement (messages per session)
- Feature adoption rate

## Deployment

### Production Checklist:

- [ ] Set `NODE_ENV=production`
- [ ] Use production Gemini API key
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure error monitoring (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure backup API providers
- [ ] Document API endpoints
- [ ] Set up CI/CD pipeline

### Environment Variables for Production:
```env
NODE_ENV=production
GEMINI_API_KEY=prod-key-here
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-random-secret
```

## Support & Resources

### Documentation:
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [API Pricing](https://ai.google.dev/pricing)

### Community:
- [Google AI Forum](https://discuss.ai.google.dev/)
- [Stack Overflow - Gemini](https://stackoverflow.com/questions/tagged/google-gemini)

### Contact:
For issues or questions about this implementation, refer to the project documentation or create an issue in the repository.

## Future Enhancements

1. **Multi-language Support**: Detect and respond in user's language
2. **Voice Input**: Add speech-to-text for hands-free interaction
3. **Smart Notifications**: Proactive suggestions based on patterns
4. **Advanced Analytics**: ML-powered productivity insights
5. **Integration Hub**: Connect with Slack, Teams, Jira, etc.
6. **Custom AI Training**: Fine-tune models with company data
7. **Collaborative AI**: Multi-user AI-assisted project planning

## Changelog

### Version 2.0.0 (Current)
- ✅ Smart project creation from natural language
- ✅ Intelligent milestone and task suggestions
- ✅ Intent recognition and routing
- ✅ Integration with Google Gemini API
- ✅ Comprehensive error handling
- ✅ Health check endpoints

### Version 1.0.0 (Previous)
- Basic chatbot with predefined responses
- Simple information retrieval
- Local processing only

---

**Last Updated**: January 2024
**Version**: 2.0.0
**Author**: AI Development Team