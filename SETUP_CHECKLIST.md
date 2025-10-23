# AI Chatbot Setup Checklist

Follow these steps to get your intelligent AI chatbot up and running!

## ✅ Pre-Setup Checklist

- [ ] Node.js installed (v16+)
- [ ] MongoDB running
- [ ] Git repository up to date
- [ ] Terminal/Command prompt ready

---

## 🔑 Step 1: Get Gemini API Key (2 minutes)

- [ ] Open browser and go to: https://makersuite.google.com/app/apikey
- [ ] Sign in with your Google account
- [ ] Click "Create API Key" button
- [ ] Copy the generated API key to clipboard
- [ ] Keep the browser tab open (you'll need it again)

**Note:** Free tier gives you 1,500 requests/day - perfect for getting started!

---

## 🔧 Step 2: Configure Backend Environment (1 minute)

Your current `.env` file location: `D:\YASH\Project Management\server\.env`

- [ ] Open the `.env` file in a text editor
- [ ] Scroll to the bottom of the file
- [ ] Add these lines:

```env
# AI Chatbot Configuration
GEMINI_API_KEY=paste-your-actual-api-key-here
```

- [ ] Replace `paste-your-actual-api-key-here` with the API key you copied
- [ ] Save the file
- [ ] Close the text editor

**Verify:** Your `.env` should now have the GEMINI_API_KEY line at the bottom

---

## 📦 Step 3: Install Backend Dependencies (1 minute)

- [ ] Open terminal/command prompt
- [ ] Navigate to server directory:
```bash
cd "D:\YASH\Project Management\server"
```

- [ ] Install axios package:
```bash
npm install axios
```

- [ ] Wait for installation to complete (should see "added 9 packages")

**Verify:** You should see success message, no errors

---

## 🧪 Step 4: Verify Setup (Optional but Recommended)

- [ ] Still in the server directory, run verification script:
```bash
node scripts/verify-ai-setup.js
```

- [ ] Check the output:
  - [ ] Environment Configuration: ✓
  - [ ] Required Files: ✓
  - [ ] Dependencies: ✓
  - [ ] Server Configuration: ✓
  - [ ] Gemini API Connection: ✓

**If all checks pass:** You're ready to go! 🎉

**If any checks fail:** Review the error messages and fix the issues

---

## 🚀 Step 5: Start the Application

### Terminal 1 - Backend Server

- [ ] Open first terminal
- [ ] Navigate to server:
```bash
cd "D:\YASH\Project Management\server"
```

- [ ] Start backend:
```bash
npm run dev
```

- [ ] Wait for "Server running on port 5000" message
- [ ] Leave this terminal running

**Verify:** You should see:
```
Server running on port 5000
Environment: development
Connected to MongoDB
```

### Terminal 2 - Frontend Application

- [ ] Open second terminal (new window/tab)
- [ ] Navigate to client:
```bash
cd "D:\YASH\Project Management\client"
```

- [ ] Start frontend:
```bash
npm run dev
```

- [ ] Wait for the local URL to appear
- [ ] Leave this terminal running

**Verify:** You should see something like:
```
VITE ready in XXXms
Local: http://localhost:3000
```

---

## 🎯 Step 6: Test the AI Chatbot

### Basic Test

- [ ] Open browser to http://localhost:3000
- [ ] Log in to your account (if required)
- [ ] Look for chatbot button in bottom-right corner (message icon)
- [ ] Click the chatbot button

**Verify:** Chat window opens with welcome message from AI

### Test 1: Smart Project Creation

- [ ] Type in chat: `Create a mobile app project to launch by December`
- [ ] Press Enter
- [ ] Wait for AI response (2-5 seconds)

**Expected Result:** 
- AI should respond with structured project details including:
  - Project Name
  - Description
  - Type
  - Category
  - Priority
- Suggestions should appear below the response

**Status:** 
- [ ] ✅ Test Passed
- [ ] ❌ Test Failed (check troubleshooting below)

### Test 2: Intelligent Task Suggestions

- [ ] Type in chat: `Suggest milestones for a website redesign project`
- [ ] Press Enter
- [ ] Wait for AI response

**Expected Result:**
- AI should respond with multiple milestones
- Each milestone should have 2-5 tasks
- Tasks should be logical and actionable

**Status:**
- [ ] ✅ Test Passed
- [ ] ❌ Test Failed (check troubleshooting below)

### Test 3: Information Retrieval

- [ ] Type in chat: `What are my pending tasks?`
- [ ] Press Enter
- [ ] Wait for response

**Expected Result:**
- AI should list your pending tasks from the database
- Tasks should show priority, due date, status
- Or message saying "no pending tasks"

**Status:**
- [ ] ✅ Test Passed
- [ ] ❌ Test Failed (check troubleshooting below)

### Test 4: General Conversation

- [ ] Type in chat: `How can I improve my team's productivity?`
- [ ] Press Enter
- [ ] Wait for response

**Expected Result:**
- AI should provide helpful, relevant advice
- Response should be well-formatted
- Suggestions should be actionable

**Status:**
- [ ] ✅ Test Passed
- [ ] ❌ Test Failed (check troubleshooting below)

---

## 🔍 Health Check (Manual Verification)

If you want to manually verify the backend:

- [ ] Open a new terminal
- [ ] Run health check:
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
    "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
  }
}
```

**Status:**
- [ ] ✅ Health Check Passed
- [ ] ❌ Health Check Failed

---

## 🐛 Troubleshooting

### Problem: "GEMINI_API_KEY is not configured"

**Solution:**
- [ ] Double-check `.env` file has `GEMINI_API_KEY=your-key`
- [ ] Verify no spaces around the `=` sign
- [ ] Ensure API key is the actual key, not placeholder text
- [ ] Restart backend server (Ctrl+C, then `npm run dev`)

### Problem: "Cannot connect to AI service"

**Solution:**
- [ ] Check backend terminal - should show "Server running on port 5000"
- [ ] Check for errors in backend terminal
- [ ] Verify `FRONTEND_URL=http://localhost:3000` in `.env`
- [ ] Check CORS errors in browser console (F12)

### Problem: "Request timeout"

**Solution:**
- [ ] Check your internet connection
- [ ] Verify you can access https://generativelanguage.googleapis.com
- [ ] Check if you've exceeded daily quota (1,500 requests)
- [ ] Try again in a few minutes

### Problem: Backend won't start

**Solution:**
- [ ] Check MongoDB is running
- [ ] Verify `MONGODB_URI` in `.env` is correct
- [ ] Run `npm install` in server directory
- [ ] Check port 5000 is not in use by another app
- [ ] Review terminal error messages

### Problem: Chatbot button doesn't appear

**Solution:**
- [ ] Check frontend is running on port 3000
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Open browser console (F12) and check for errors
- [ ] Try refreshing the page
- [ ] Try different browser

### Problem: AI gives weird/unexpected responses

**Solution:**
- [ ] This is normal occasionally - AI is probabilistic
- [ ] Try rephrasing your question
- [ ] Be more specific in your request
- [ ] Check backend logs for API errors

---

## 📊 Success Indicators

You know everything is working correctly when:

- [ ] ✅ Backend starts without errors
- [ ] ✅ Frontend starts without errors
- [ ] ✅ Chatbot button visible in UI
- [ ] ✅ Chat window opens when clicked
- [ ] ✅ AI responds to messages within 5 seconds
- [ ] ✅ Can create projects from natural language
- [ ] ✅ Can get milestone/task suggestions
- [ ] ✅ Can query pending tasks and projects
- [ ] ✅ Responses are intelligent and relevant
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in backend terminal

---

## 🎉 Post-Setup Actions

Once everything is working:

### Immediate Next Steps
- [ ] Test all AI features with real use cases
- [ ] Create a few projects using the AI
- [ ] Get milestone suggestions for actual projects
- [ ] Familiarize yourself with different types of queries

### Optional Customization
- [ ] Review `AI_CHATBOT_SETUP.md` for customization options
- [ ] Adjust AI temperature in `llmService.ts` if needed
- [ ] Modify project schema if you need custom fields
- [ ] Customize welcome message in `AIChatbot.tsx`

### Monitoring
- [ ] Visit https://makersuite.google.com to monitor API usage
- [ ] Check daily request count
- [ ] Review any rate limit warnings
- [ ] Plan for upgrade if needed

### Documentation
- [ ] Read `AI_CHATBOT_QUICKSTART.md` for examples
- [ ] Review `AI_IMPLEMENTATION_SUMMARY.md` for technical details
- [ ] Bookmark troubleshooting sections
- [ ] Share setup guide with team members

---

## 📝 Notes Section

Use this space to track any issues or customizations:

**Issues Encountered:**
- 
- 
- 

**Customizations Made:**
- 
- 
- 

**API Key Details:**
- Created on: _______________
- Daily limit: 1,500 requests
- Monitored via: https://makersuite.google.com

**Setup Completed By:** _______________
**Date:** _______________
**Time Taken:** _______________ minutes

---

## 🚨 Important Reminders

- ⚠️ **Never commit `.env` file to Git** - It contains your API key
- ⚠️ **Keep API key secret** - Don't share it publicly
- ⚠️ **Monitor usage** - Free tier has daily limits
- ⚠️ **Backup configuration** - Save `.env` securely
- ⚠️ **Test regularly** - Ensure API key hasn't expired

---

## 🆘 Need Help?

If you're stuck:

1. **Check Documentation:**
   - [ ] `AI_CHATBOT_QUICKSTART.md` - Quick solutions
   - [ ] `AI_CHATBOT_SETUP.md` - Detailed guide
   - [ ] `AI_IMPLEMENTATION_SUMMARY.md` - Technical details

2. **Review Logs:**
   - [ ] Backend terminal output
   - [ ] Browser console (F12)
   - [ ] MongoDB logs

3. **Verify Configuration:**
   - [ ] Run `node scripts/verify-ai-setup.js`
   - [ ] Check all environment variables
   - [ ] Verify API key is valid

4. **Test Manually:**
   - [ ] Test health endpoint with curl
   - [ ] Check MongoDB connection
   - [ ] Verify frontend can reach backend

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Backend running smoothly
- [ ] Frontend running smoothly
- [ ] Chatbot responds to all test queries
- [ ] No errors in terminals or console
- [ ] API key working and monitored
- [ ] Documentation reviewed
- [ ] Team members informed (if applicable)
- [ ] Backup of `.env` file saved securely

---

**🎊 Congratulations!**

If all checkboxes above are checked, your AI chatbot is fully operational and ready for production use!

**Setup Status:** 
- [ ] ✅ Complete
- [ ] ⚠️ Partial (note issues above)
- [ ] ❌ Not Started

**Last Updated:** January 2024
**Version:** 2.0.0