# AI Chatbot Troubleshooting Guide

## Common Error: "Sorry, I encountered an error. Please try again."

This error occurs when the AI chatbot cannot communicate with the Gemini API. Here's how to fix it:

---

## 🔍 Root Cause

The chatbot requires a valid **GEMINI_API_KEY** to function. When this key is missing, empty, or invalid, the chatbot cannot process your requests and shows this generic error message.

---

## ✅ Solution Steps

### Step 1: Get a Gemini API Key

1. **Visit Google AI Studio**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Sign in** with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. **Copy** the generated API key (it will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

> **Note**: The API key is free to use with generous quotas for development.

### Step 2: Configure the API Key

1. Navigate to your server directory:
   ```
   D:\YASH\Project Management\server
   ```

2. Open the `.env` file in a text editor (e.g., Notepad, VS Code)

3. Find the line that says:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

4. Replace `your-api-key-here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

5. **Save the file**

> **Important**: 
> - There should be **NO spaces** around the `=` sign
> - There should be **NO quotes** around the API key
> - The API key should be on a single line

### Step 3: Restart the Server

The server needs to be restarted to load the new environment variables:

1. **Stop the server**: Press `Ctrl + C` in the terminal where the server is running

2. **Start the server again**:
   ```bash
   cd "D:\YASH\Project Management\server"
   npm start
   ```

3. Wait for the message: `Server is running on port 5000`

### Step 4: Verify the Setup

Run the verification script to ensure everything is configured correctly:

```bash
cd "D:\YASH\Project Management\server"
node scripts/verify-ai-key.js
```

This script will check:
- ✅ If the API key is set
- ✅ If the API key is valid
- ✅ If the server can connect to Gemini API
- ✅ If the server health endpoint reports AI as configured

### Step 5: Test the Chatbot

1. **Refresh your frontend** (press `F5` or `Ctrl + R`)
2. **Open the chatbot** by clicking the chatbot button
3. **Send a test message** like "Hello" or "What can you help me with?"
4. The chatbot should now respond successfully!

---

## 🔧 Manual Verification

If you want to manually verify the setup without the script:

### Check if API Key is Loaded

```bash
cd "D:\YASH\Project Management\server"
node -e "require('dotenv').config(); console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set ✓' : 'Missing ✗');"
```

**Expected output**: `GEMINI_API_KEY: Set ✓`

### Check Server Health Endpoint

```bash
curl http://localhost:5000/api/ai/health
```

**Expected output**:
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "aiConfigured": true,
    "timestamp": "2025-10-21T07:30:00.000Z"
  }
}
```

**Key indicator**: `"aiConfigured": true` (not false)

### Test the API Directly

You can test if your API key works by making a direct request to Gemini:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

Replace `YOUR_API_KEY` with your actual key.

---

## 🐛 Other Common Issues

### Issue 1: "Request timeout" Error

**Symptom**: Chatbot shows a timeout error after 30 seconds

**Causes**:
- Slow internet connection
- Gemini API is experiencing high load
- API request is too complex

**Solutions**:
1. Check your internet connection
2. Try a simpler question first
3. Wait a few moments and try again

### Issue 2: API Key Invalid

**Symptom**: Server logs show "API key not valid" or "403 Forbidden"

**Causes**:
- API key was copied incorrectly
- API key has been revoked or expired
- API key hasn't been activated

**Solutions**:
1. Double-check that you copied the entire API key
2. Generate a new API key from Google AI Studio
3. Ensure the Gemini API is enabled in your Google Cloud project

### Issue 3: CORS Errors

**Symptom**: Browser console shows CORS errors

**Solutions**:
1. This is a backend issue - the API calls are made server-side
2. Ensure your server is running on the correct port (5000)
3. Check that `REACT_APP_API_URL` in client `.env` points to `http://localhost:5000`

### Issue 4: "No response from Gemini API"

**Symptom**: Server logs show connection errors to Gemini

**Causes**:
- Network connectivity issues
- Firewall blocking API requests
- Proxy settings interfering

**Solutions**:
1. Test your internet connection
2. Check firewall settings
3. If using a proxy, configure it properly
4. Try accessing https://generativelanguage.googleapis.com in your browser

---

## 📋 Checklist

Before reporting issues, verify:

- [ ] GEMINI_API_KEY is set in `server/.env`
- [ ] API key has no spaces, quotes, or extra characters
- [ ] Server has been restarted after adding the API key
- [ ] Server health endpoint shows `"aiConfigured": true`
- [ ] Server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Browser console has no errors
- [ ] Internet connection is working

---

## 🆘 Getting Help

If you've tried all the above and still have issues:

1. **Check Server Logs**: Look at the terminal where the server is running for error messages

2. **Check Browser Console**: Open Developer Tools (F12) and look for errors in the Console tab

3. **Run the Verification Script**: 
   ```bash
   node scripts/verify-ai-key.js
   ```
   And share the output

4. **Share Error Details**: Include:
   - The exact error message
   - Server logs (without exposing your API key)
   - Browser console errors
   - Result of verification script

---

## 📚 Related Documentation

- [AI Chatbot Setup Guide](./AI_CHATBOT_SETUP.md)
- [Quick Start Guide](./AI_CHATBOT_QUICKSTART.md)
- [Implementation Summary](./AI_IMPLEMENTATION_SUMMARY.md)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)

---

## 🎉 Success!

Once everything is configured correctly:

1. The chatbot will respond to your messages
2. You can ask it to:
   - Create new projects from descriptions
   - Suggest milestones and tasks
   - Show your pending tasks
   - Analyze your work patterns
   - Answer general questions about project management

Enjoy using your AI-powered project management assistant! 🚀