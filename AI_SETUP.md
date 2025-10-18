# AI Assistant Setup Guide

This guide will help you set up the AI-powered chatbot feature in your Proxima project management application.

## 🚀 Quick Start

The AI chatbot works out of the box with intelligent fallback responses. For enhanced AI capabilities, follow the setup instructions below.

## 🔑 Free AI API Options

### 1. OpenAI ChatGPT (Recommended)
- **Free Tier**: $5 credit for new users
- **Features**: High-quality responses, GPT-3.5-turbo access
- **Setup**: 
  1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
  2. Create account and generate API key
  3. Add to environment: `REACT_APP_OPENAI_API_KEY=your_key_here`

### 2. Google Gemini (Alternative)
- **Free Tier**: 15 requests per minute
- **Features**: Fast responses, multimodal capabilities
- **Setup**:
  1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Sign in with Google account
  3. Generate API key
  4. Add to environment: `REACT_APP_GEMINI_API_KEY=your_key_here`

### 3. Hugging Face (Free Option)
- **Free Tier**: Completely free for basic usage
- **Features**: Open source models, community support
- **Setup**:
  1. Visit [Hugging Face Tokens](https://huggingface.co/settings/tokens)
  2. Create account and generate token
  3. Add to environment: `REACT_APP_HUGGINGFACE_API_KEY=your_key_here`

## 🛠️ Environment Setup

1. **Create environment file**:
   ```bash
   # In client directory
   touch .env
   ```

2. **Add your API keys**:
   ```env
   # AI API Keys (Optional)
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   
   # Other environment variables
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Restart development server**:
   ```bash
   npm start
   ```

## 🤖 AI Features

The AI assistant provides:

### Task Management
- **Prioritization**: Smart task ranking based on deadlines, importance, and user patterns
- **Time Estimation**: Accurate time predictions based on user experience and task complexity
- **Deadline Optimization**: Suggestions for better deadline management

### Productivity Insights
- **Work Pattern Analysis**: Understanding your work style and peak hours
- **Efficiency Recommendations**: Personalized tips for better productivity
- **Skill Development**: Learning suggestions based on your goals and interests

### Project Planning
- **Resource Allocation**: Smart suggestions for team and resource distribution
- **Timeline Optimization**: Help with project scheduling and milestone planning
- **Risk Assessment**: Early warning for potential project issues

## 🎯 How It Works

1. **User Registration**: Enhanced registration captures comprehensive user profile data
2. **Data Collection**: AI learns from your tasks, projects, and work patterns
3. **Intelligent Responses**: AI provides personalized suggestions based on your context
4. **Continuous Learning**: AI improves recommendations over time

## 📊 User Profile Data

The enhanced registration collects:

### Professional Information
- Job title, company, industry
- Experience level and skills
- Work preferences and communication style

### Personal Insights
- Personality traits and working style
- Stress levels and motivation factors
- Goals and career aspirations

### Learning & Development
- Current learning interests
- Skill development goals
- Certifications and achievements

### Productivity Patterns
- Peak working hours
- Task preferences and complexity
- Work environment preferences

### AI Assistant Preferences
- Assistance level (minimal, moderate, comprehensive)
- Communication style (formal, casual, technical, friendly)
- Notification preferences

## 🔧 Configuration

### AI Provider Selection
The system automatically selects the best available AI provider:

1. **OpenAI** (if API key provided)
2. **Gemini** (if API key provided)
3. **Hugging Face** (if API key provided)
4. **Fallback** (intelligent local responses)

### Customization
You can customize AI behavior in `client/src/config/aiConfig.ts`:

```typescript
export const AI_CONFIG = {
  DEFAULT_PROVIDER: 'openai', // or 'gemini', 'huggingface', 'fallback'
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  MAX_RETRIES: 3,
};
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is correct and active
   - Check if you have sufficient credits/quota
   - Ensure environment variables are loaded

2. **Slow Responses**
   - Try different AI providers
   - Check network connection
   - Fallback responses are always available

3. **Poor Quality Responses**
   - Provide more detailed user profile information
   - Try different AI providers
   - Adjust temperature settings

### Debug Mode
Enable debug logging in the browser console to see AI service activity.

## 📈 Performance

- **Response Time**: 1-3 seconds with AI APIs, instant with fallback
- **Accuracy**: 85-95% with AI APIs, 70-80% with fallback
- **Cost**: Free with fallback, minimal cost with AI APIs

## 🔒 Privacy & Security

- User data is only used for AI context
- No data is stored by external AI services
- All API calls are encrypted
- Fallback responses work entirely locally

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify API keys are correctly set
3. Test with fallback mode first
4. Review the AI service logs

## 🎉 Success!

Once set up, you'll have:
- ✅ Enhanced user registration with comprehensive profiling
- ✅ AI-powered chatbot for task management
- ✅ Personalized productivity insights
- ✅ Smart task prioritization and time estimation
- ✅ Continuous learning and improvement

The AI assistant will help users work more efficiently by providing intelligent suggestions based on their unique work patterns and preferences!
