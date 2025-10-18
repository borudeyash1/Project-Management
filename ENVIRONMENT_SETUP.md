# 🔐 Environment Configuration Guide

## 🚨 CRITICAL: MongoDB URL Security Fixed!

Your MongoDB Cloud URL has been **REMOVED** from all code files for security. It's now only in your `.env` file.

## 📁 Required .env Files

### 1. **Server .env File** (`server/.env`)

Create this file in your `server` directory:

```env
# Database
MONGODB_URI=mongodb+srv://borudeyash1:%40Tatya24%40@cluster0.rx04y6n.mongodb.net/Project_management

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google OAuth (Add your credentials here)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 2. **Client .env File** (`client/.env`)

Create this file in your `client` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# AI APIs (Optional)
REACT_APP_OPENAI_API_KEY=your_openai_key
REACT_APP_GEMINI_API_KEY=your_gemini_key
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_key
```

## 🔑 Google OAuth Setup Steps

Based on your Google Cloud Console screenshot, you've successfully created the OAuth client. Now you need to:

### Step 1: Get Your Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click on your "Project Management" OAuth 2.0 Client ID
4. Copy the **Client ID** and **Client Secret**

### Step 2: Update Your .env Files

**In `server/.env`:**
```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
```

**In `client/.env`:**
```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Step 3: Restart Applications
After updating `.env` files:
```bash
# Stop both client and server (Ctrl+C)
# Then restart:

# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm start
```

## ✅ Security Improvements Made

1. **✅ Removed hardcoded MongoDB URL** from `server/src/server.ts`
2. **✅ Updated SETUP_GUIDE.md** to use correct database name
3. **✅ Created configuration guide** for proper `.env` setup
4. **✅ Added Google OAuth configuration** templates

## 🚀 Next Steps

1. **Create the `.env` files** using the templates above
2. **Add your Google OAuth credentials** from Google Cloud Console
3. **Restart both applications**
4. **Test Google sign-in** on `http://localhost:3000/login`

Your application is now secure and ready for Google OAuth! 🎉
