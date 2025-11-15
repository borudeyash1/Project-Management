# Quick Fix Instructions - AI Chatbot Setup

## Issue Summary
Your AI chatbot is showing "Sorry, I encountered an error" because:
1. Missing `GEMINI_API_KEY` in server `.env`
2. API URL path issue (already fixed in code)

## Step-by-Step Fix (5 minutes)

### Step 1: Get Your Free Gemini API Key (2 minutes)

1. Open your browser and go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Copy the generated API key (it looks like: `AIzaSy...`)

### Step 2: Add API Key to Server (1 minute)

1. Open file: `D:\YASH\Project Management\server\.env`
2. Add this line at the END of the file:

```
# AI Chatbot Configuration
GEMINI_API_KEY=paste-your-actual-api-key-here
```

3. Replace `paste-your-actual-api-key-here` with the API key you copied
4. Save the file

**Your server/.env should now look like this:**
```
# Database
MONGODB_URI=mongodb+srv://borudeyash1:%40Tatya24%40@cluster0.rx04y6n.mongodb.net/Project_management

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=58699586249-un5rigsrp66rk5vi24egkockgrq5gg85.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here

# AI Chatbot Configuration
GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

### Step 3: Restart Backend Server (1 minute)

1. Go to the terminal where your backend is running
2. Press `Ctrl+C` to stop the server
3. Run:
```bash
cd "D:\YASH\Project Management\server"
npm run dev
```
4. Wait for "Server running on port 5000" message

### Step 4: Restart Frontend (1 minute)

1. Go to the terminal where your frontend is running
2. Press `Ctrl+C` to stop it
3. Run:
```bash
cd "D:\YASH\Project Management\client"
npm start
```
4. Wait for it to start

### Step 5: Test the Chatbot ✅

1. Open http://localhost:3000 in your browser
2. Look for the **orange/yellow circular button** in the bottom-right corner
3. Click on it to open the chatbot
4. Type: **"Create a mobile app project"**
5. Press Enter

**Expected Result:** The AI should respond with a structured project suggestion including name, description, type, category, and priority.

## If Chatbot Button is Not Visible

The chatbot button might only appear on the Dashboard page. If you don't see it:

1. Navigate to your Dashboard page in the app
2. Look in the bottom-right corner for the floating button
3. If still not visible, check browser console (F12) for any errors

## Troubleshooting

### Problem: Still getting "Sorry, I encountered an error"

**Check 1: Verify API Key is Set**
```bash
cd "D:\YASH\Project Management\server"
node -e "require('dotenv').config(); console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set ✓' : 'Missing ✗');"
```

**Check 2: Test Backend Health**
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

**Check 3: Look at Backend Terminal**
- Check for any error messages
- Look for "Gemini API key is not configured" warnings

### Problem: Backend won't start

**Solution:**
```bash
cd "D:\YASH\Project Management\server"
npm install
npm run build
npm run dev
```

### Problem: Frontend shows network error

**Check:** Make sure both servers are running:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

## Test Commands

Once everything is running, try these in the chatbot:

1. **"Create a marketing project for Q1"**
2. **"Suggest milestones for a website redesign project"**
3. **"What are my pending tasks?"**
4. **"Show me my active projects"**

## API Usage Limits (Free Tier)

- **60 requests per minute**
- **1,500 requests per day**
- Perfect for development and testing!

## What Was Fixed in the Code

✅ Removed duplicate `auth.js` file causing User.findById errors
✅ Fixed axios dependency issue by using native fetch
✅ Fixed API URL path doubling issue (was calling /api/api/chat)
✅ Added proper TypeScript typing throughout
✅ Fixed all Mongoose schema compilation errors
✅ Created comprehensive AI service with intent recognition

## Files Modified

- `server/src/services/llmService.ts` - NEW: Gemini API integration
- `server/src/services/aiService.ts` - NEW: Intent recognition & routing
- `server/src/controllers/aiController.ts` - NEW: API endpoints
- `server/src/routes/ai.ts` - NEW: Routes
- `server/src/server.ts` - Added AI routes
- `client/src/services/aiService.ts` - Refactored to use native fetch
- `server/src/middleware/auth.js` - DELETED (was causing errors)

## Need More Help?

1. Check `AI_CHATBOT_QUICKSTART.md` for detailed documentation
2. Check `AI_CHATBOT_SETUP.md` for comprehensive setup guide
3. Run the verification script:
   ```bash
   cd "D:\YASH\Project Management\server"
   node scripts/verify-ai-setup.js
   ```

## Success Checklist

- [ ] Gemini API key obtained
- [ ] API key added to server/.env
- [ ] Backend restarted successfully
- [ ] Frontend restarted successfully
- [ ] Chatbot button visible in UI
- [ ] Chatbot responds to "Create a project"
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

**Quick Summary:**
1. Get API key from https://makersuite.google.com/app/apikey
2. Add `GEMINI_API_KEY=your-key` to server/.env
3. Restart both backend and frontend
4. Test with "Create a mobile app project"

That's it! Your AI chatbot should now work perfectly. 🎉