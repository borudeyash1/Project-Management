# 🚀 Proxima Setup Guide

This guide will help you set up and run the Proxima project management application with AI features.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## 🛠️ Installation Steps

### 1. **Start the Backend Server**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example if available)
# Add your MongoDB connection string
echo "MONGODB_URI=mongodb://localhost:27017/Project_management" > .env
echo "JWT_SECRET=your-super-secret-jwt-key" >> .env
echo "JWT_REFRESH_SECRET=your-super-secret-refresh-key" >> .env

# Start the server
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server running on port 5000
🌍 Environment: development
```

### 2. **Start the Frontend Client**

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

**Expected Output:**
```
✅ Compiled successfully!
🌐 Local: http://localhost:3000
🌐 Network: http://192.168.x.x:3000
```

### 3. **Seed the Database (Optional)**

```bash
# In the server directory
npm run seed
```

**Expected Output:**
```
🌱 Starting database seeding...
✅ Connected to MongoDB
🗑️  Cleared existing data
👥 Created 3 users
🏢 Created 2 workspaces
📁 Created 2 projects
📋 Created 2 tasks
✅ Database seeding completed successfully!

🔑 Test User Credentials:
Alex Johnson - alex@example.com / password123
Sarah Chen - sarah@example.com / sarah123
Mike Rodriguez - mike@example.com / mike123
```

## 🎯 Testing the Application

### 1. **Enhanced Registration**
- Visit: `http://localhost:3000/register`
- Complete the 5-step registration process
- Test with different user profiles

### 2. **AI Chatbot**
- After registration, you'll be redirected to the dashboard
- Look for the floating chatbot button (bottom-right corner)
- Click to open the AI assistant
- Test different queries like:
  - "Help me prioritize my tasks"
  - "Estimate time for my project"
  - "Analyze my productivity"

### 3. **Login with Test Users**
- Visit: `http://localhost:3000/login`
- Use any of the test credentials from the seed data

## 🔧 Troubleshooting

### **"Failed to fetch" Error**

This usually means the backend server isn't running:

1. **Check if server is running:**
   ```bash
   # In server directory
   node scripts/check-server.js
   ```

2. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Check server logs for errors**

### **Notifications Hidden Behind Navigation**

✅ **Fixed!** Notifications now appear below the navigation bar with higher z-index.

### **Database Connection Issues**

1. **Check MongoDB is running:**
   ```bash
   # For local MongoDB
   mongod --version
   
   # For MongoDB Atlas, check your connection string
   ```

2. **Update .env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/Project_management
   # OR for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Project_management
   ```

### **TypeScript Errors**

✅ **Fixed!** All TypeScript errors have been resolved.

## 🎨 Features Overview

### **Enhanced Registration System**
- **5-Step Process**: Basic Info → Professional → Skills & Goals → Preferences → AI Setup
- **Comprehensive Profiling**: Captures detailed user information for AI personalization
- **Real-time Validation**: Prevents progression with invalid data
- **Beautiful UI**: Modern, responsive design with progress tracking

### **AI-Powered Chatbot**
- **Context-Aware**: Uses user profile and work patterns for personalized responses
- **Multiple AI Providers**: OpenAI, Gemini, Hugging Face, or intelligent fallback
- **Smart Suggestions**: Task prioritization, time estimation, productivity insights
- **Floating Interface**: Easy access from any page

### **Database Integration**
- **Enhanced User Model**: Comprehensive profile schema with nested objects
- **AI Preferences**: Customizable assistance level and communication style
- **Work Patterns**: Peak hours, task preferences, productivity insights
- **Learning Goals**: Skill development and career aspirations

## 🔑 Environment Variables

### **Server (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/Project_management

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### **Client (.env)**
```env
# API
REACT_APP_API_URL=http://localhost:5000/api

# AI APIs (Optional)
REACT_APP_OPENAI_API_KEY=your_openai_key
REACT_APP_GEMINI_API_KEY=your_gemini_key
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_key
```

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend  
cd client
npm install
npm start

# Terminal 3 - Database (Optional)
cd server
npm run seed
```

## 📊 Expected Results

After successful setup:

1. **Backend Server**: Running on `http://localhost:5000`
2. **Frontend App**: Running on `http://localhost:3000`
3. **Database**: Populated with test data (if seeded)
4. **AI Chatbot**: Available on all pages
5. **Enhanced Registration**: Working with validation
6. **Notifications**: Properly positioned below navigation

## 🎉 Success Indicators

- ✅ Server logs show "Connected to MongoDB"
- ✅ Client shows "Compiled successfully"
- ✅ Registration form validates each step
- ✅ AI chatbot responds to queries
- ✅ Notifications appear in correct position
- ✅ Database contains user profiles with AI preferences

## 🆘 Getting Help

If you encounter issues:

1. **Check server logs** for error messages
2. **Verify MongoDB connection** is working
3. **Ensure all dependencies** are installed
4. **Check environment variables** are set correctly
5. **Try the seed script** to populate test data

The application is now ready with enhanced registration, AI-powered chatbot, and comprehensive user profiling! 🎯
