// AI Configuration
// Add your free API keys here to enable AI features

export const AI_CONFIG = {
  // OpenAI API (Free tier available)
  // Get your key at: https://platform.openai.com/api-keys
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',

  // Google Gemini API (Free tier available)
  // Get your key at: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || '',

  // Hugging Face API (Free tier available)
  // Get your key at: https://huggingface.co/settings/tokens
  HUGGINGFACE_API_KEY: process.env.REACT_APP_HUGGINGFACE_API_KEY || '',

  // Default AI provider preference
  DEFAULT_PROVIDER: 'fallback' as 'openai' | 'gemini' | 'huggingface' | 'fallback',

  // AI response settings
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  MAX_RETRIES: 3,
};

// Free AI API Resources:
export const AI_RESOURCES = {
  OPENAI: {
    name: 'OpenAI ChatGPT',
    url: 'https://platform.openai.com/api-keys',
    freeTier: 'Yes - $5 free credit',
    features: ['GPT-3.5-turbo', 'GPT-4 access', 'High quality responses']
  },
  GEMINI: {
    name: 'Google Gemini',
    url: 'https://makersuite.google.com/app/apikey',
    freeTier: 'Yes - Free tier available',
    features: ['Gemini Pro', 'Multimodal capabilities', 'Fast responses']
  },
  HUGGINGFACE: {
    name: 'Hugging Face',
    url: 'https://huggingface.co/settings/tokens',
    freeTier: 'Yes - Free inference API',
    features: ['Open source models', 'Community models', 'No cost']
  }
};

// Instructions for setting up AI APIs
export const SETUP_INSTRUCTIONS = `
To enable AI features in your Sartthi app:

1. **OpenAI (Recommended):**
   - Visit: https://platform.openai.com/api-keys
   - Create an account and get your API key
   - Add to environment: REACT_APP_OPENAI_API_KEY=your_key_here
   - Free tier: $5 credit for new users

2. **Google Gemini (Alternative):**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Generate API key
   - Add to environment: REACT_APP_GEMINI_API_KEY=your_key_here
   - Free tier: 15 requests per minute

3. **Hugging Face (Free Option):**
   - Visit: https://huggingface.co/settings/tokens
   - Create account and generate token
   - Add to environment: REACT_APP_HUGGINGFACE_API_KEY=your_key_here
   - Completely free for basic usage

4. **Environment Setup:**
   - Create .env file in client directory
   - Add your API keys
   - Restart the development server

The app will work with intelligent fallback responses even without API keys!
`;

export default AI_CONFIG;
