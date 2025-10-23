# AI Chatbot Quick Start Guide

Get your intelligent AI chatbot up and running in 5 minutes!

## 🚀 Quick Setup

### Step 1: Get Your Free Gemini API Key (2 minutes)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

**Free Tier Includes:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for development!

### Step 2: Add API Key to Server (1 minute)

1. Open `server/.env` file
2. Add this line at the end:
   ```env
   # AI Chatbot Configuration
   GEMINI_API_KEY=your-api-key-here
   ```
3. Replace `your-api-key-here` with your actual API key
4. Save the file

### Step 3: Install Dependencies (1 minute)

Open terminal in the `server` directory:

```bash
cd "D:\YASH\Project Management\server"
npm install axios
```

### Step 4: Start the Application (1 minute)

**Terminal 1 - Start Backend:**
```bash
cd "D:\YASH\Project Management\server"
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd "D:\YASH\Project Management\client"
npm run dev
```

### Step 5: Test the Chatbot! ✅

1. Open http://localhost:3000 in your browser
2. Click the chatbot button (bottom-right corner with the message icon)
3. Try these commands:

   ```
   Create a mobile app project to launch by December
   ```

   ```
   Suggest milestones for my website redesign project
   ```

   ```
   What are my pending tasks?
   ```

## 🎯 What Can the AI Do?

### 1. Smart Project Creation
**You say:** "Create a marketing project for Q1 2024"

**AI does:** Creates a complete project with:
- Project name
- Description
- Type and category
- Priority level

### 2. Intelligent Task Suggestions
**You say:** "Suggest tasks for my mobile app project"

**AI does:** Generates:
- Multiple milestones
- Tasks for each milestone
- Logical project breakdown

### 3. Information Retrieval
**Available commands:**
- "What are my pending tasks?"
- "Show me overdue deadlines"
- "What projects am I working on?"
- "Help me prioritize my tasks"

### 4. General Help
Ask anything about project management:
- "How do I improve productivity?"
- "Best practices for remote teams"
- "Help me create a timeline"

## 🔍 Verify Everything is Working

### Test 1: Check Backend Health
```bash
curl http://localhost:5000/api/ai/health
```

**Expected Response:**
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

### Test 2: Test Project Creation
Open the chatbot and type:
```
Create a website project
```

You should see a detailed project suggestion with name, description, type, category, and priority.

### Test 3: Test Task Suggestions
Type in the chatbot:
```
Suggest milestones for a marketing campaign
```

You should see multiple milestones with tasks for each.

## ⚠️ Troubleshooting

### Problem: "Gemini API key is not configured"
**Solution:**
1. Check that `.env` file exists in `server/` folder
2. Verify `GEMINI_API_KEY=your-key` is present
3. Make sure there are no spaces around the `=`
4. Restart the backend server

### Problem: "Cannot connect to AI service"
**Solution:**
1. Check backend is running on port 5000
2. Look for "Server running on port 5000" message
3. Verify no errors in the terminal

### Problem: Chatbot button doesn't appear
**Solution:**
1. Check frontend is running on port 3000
2. Clear browser cache
3. Check browser console for errors (F12)

### Problem: "Request timeout"
**Solution:**
1. Check your internet connection
2. Verify Gemini API is accessible
3. Check if you've exceeded daily quota (1,500 requests/day)

### Problem: Backend won't start
**Solution:**
```bash
cd server
npm install
npm run dev
```

If still failing, check:
- MongoDB is running
- All environment variables are set
- No other service is using port 5000

## 📝 Example Conversations

### Example 1: Creating a Project
```
You: I need to create a mobile app by Q2

AI: Okay, I've drafted a project for you:

**Project Name:** Mobile App Development
**Description:** Develop and launch a mobile application by Q2, covering design, development, testing, and deployment phases.
**Type:** Software Development
**Category:** Mobile
**Priority:** High

Does this look right? Would you like me to suggest some milestones and tasks?

You: Yes, suggest milestones!

AI: Here are some suggested milestones and tasks for "Mobile App Development":

**1. Phase 1: Planning & Design**
   • Define app requirements and user stories
   • Create UI/UX wireframes
   • Design app architecture
   ...
```

### Example 2: Checking Tasks
```
You: What are my pending tasks?

AI: You have 5 pending tasks:

1. 🔴 **Complete API integration**
   Status: in-progress | Due: 12/15/2024

2. 🟡 **Review pull requests**
   Status: pending | Due: 12/16/2024
   ...
```

### Example 3: General Help
```
You: How can I improve my team's productivity?

AI: Here are some evidence-based strategies to improve team productivity:

1. **Clear Communication**: Establish regular check-ins and use project management tools
2. **Set Clear Goals**: Use SMART goals for each team member
3. **Remove Blockers**: Identify and address obstacles quickly
...
```

## 🎨 Customization Tips

### Change AI Response Style
Edit `server/src/services/llmService.ts`:
```typescript
generationConfig: {
  temperature: 0.7,  // Lower = more consistent, Higher = more creative
  topK: 40,
  topP: 0.95,
}
```

### Add Custom Project Fields
Edit the JSON schema in `generateProjectFromNaturalLanguage`:
```typescript
JSON Schema:
{
    "projectName": "string",
    "projectDescription": "string",
    "projectType": "string",
    "projectCategory": "string",
    "priorityLevel": "string",
    "budget": "string",           // Add custom fields
    "estimatedDuration": "string"
}
```

### Modify Welcome Message
Edit `client/src/components/AIChatbot.tsx`:
```typescript
const welcomeMessage: Message = {
  id: '1',
  type: 'ai',
  content: `Your custom welcome message here!`,
  timestamp: new Date(),
  suggestions: [
    'Your custom suggestion 1',
    'Your custom suggestion 2'
  ]
};
```

## 📊 Monitoring Usage

### Check API Usage
Visit [Google AI Studio Dashboard](https://makersuite.google.com/)
- View daily request count
- Monitor rate limits
- Check for errors

### Backend Logs
Watch the terminal where backend is running:
- Intent recognition: `Recognized intent: CREATE_PROJECT`
- API calls: Request/response logs
- Errors: Full error messages

### Frontend Logs
Open browser console (F12):
- AI service calls
- Response times
- Any client-side errors

## 🔐 Security Checklist

- [x] API key is in `.env` file (not in code)
- [x] `.env` is in `.gitignore`
- [x] Backend validates all inputs
- [x] Rate limiting is enabled
- [ ] Add authentication middleware (recommended for production)
- [ ] Set up HTTPS (required for production)

## 📚 Learn More

**Full Documentation:**
- [AI_CHATBOT_SETUP.md](./AI_CHATBOT_SETUP.md) - Complete setup guide
- [Server README](./server/README.md) - Backend documentation
- [Client README](./client/README.md) - Frontend documentation

**API Documentation:**
- [Google Gemini Docs](https://ai.google.dev/docs)
- [API Reference](https://ai.google.dev/api)

**Support:**
- Check existing issues in the repository
- Review the troubleshooting section above
- Check server logs for detailed error messages

## ✅ Success Checklist

After setup, you should be able to:

- [x] See chatbot button in bottom-right corner
- [x] Click to open chat interface
- [x] Send a message and get AI response
- [x] Create a project from natural language
- [x] Get milestone and task suggestions
- [x] View pending tasks and deadlines
- [x] Have natural conversations with the AI

## 🎉 Next Steps

1. **Try All Features**: Test project creation, task suggestions, and info retrieval
2. **Integrate with Your Workflow**: Start using it for real projects
3. **Customize**: Adjust prompts and responses to match your needs
4. **Explore**: Try different types of queries and see what the AI can do
5. **Monitor**: Keep an eye on API usage and performance

## 💡 Pro Tips

1. **Be Specific**: "Create a mobile app project for iOS with React Native" gives better results than just "Create a project"

2. **Iterate**: Ask follow-up questions to refine the AI's suggestions

3. **Use Context**: The AI remembers your projects and tasks, so ask contextual questions

4. **Combine Features**: Create a project, then immediately ask for milestone suggestions

5. **Learn the Patterns**: After a few uses, you'll know exactly how to phrase requests for best results

## 🐛 Found a Bug?

1. Check the backend terminal for error messages
2. Check browser console (F12) for frontend errors
3. Verify API key is correct and not expired
4. Review the troubleshooting section above
5. Check if issue is with Gemini API (visit Google AI Studio)

---

**Setup Time:** ~5 minutes  
**Difficulty:** Easy  
**Cost:** Free (up to 1,500 requests/day)

Happy chatting with your new AI assistant! 🤖✨