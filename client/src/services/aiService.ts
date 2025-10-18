// AI Service for integrating with free AI APIs
// This service provides fallback options and handles different AI providers

import { AI_CONFIG } from '../config/aiConfig';

interface AIResponse {
  content: string;
  suggestions?: string[];
  confidence?: number;
}

interface UserContext {
  profile?: any;
  projects?: any[];
  tasks?: any[];
  workspaces?: any[];
}

class AIService {
  private apiKeys: {
    openai?: string;
    gemini?: string;
    huggingface?: string;
  } = {};

  constructor() {
    // Load API keys from configuration
    this.apiKeys = {
      openai: AI_CONFIG.OPENAI_API_KEY,
      gemini: AI_CONFIG.GEMINI_API_KEY,
      huggingface: AI_CONFIG.HUGGINGFACE_API_KEY,
    };
  }

  // Main method to get AI response
  async getAIResponse(
    message: string, 
    userContext: UserContext,
    provider: 'openai' | 'gemini' | 'huggingface' | 'fallback' = 'fallback'
  ): Promise<AIResponse> {
    try {
      switch (provider) {
        case 'openai':
          return await this.getOpenAIResponse(message, userContext);
        case 'gemini':
          return await this.getGeminiResponse(message, userContext);
        case 'huggingface':
          return await this.getHuggingFaceResponse(message, userContext);
        default:
          return await this.getFallbackResponse(message, userContext);
      }
    } catch (error) {
      console.error(`AI service error (${provider}):`, error);
      // Fallback to local response
      return await this.getFallbackResponse(message, userContext);
    }
  }

  // OpenAI API integration
  private async getOpenAIResponse(message: string, userContext: UserContext): Promise<AIResponse> {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildPrompt(message, userContext);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for a project management platform. Help users with task prioritization, time estimation, productivity insights, and work optimization. Be helpful, concise, and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      confidence: 0.9
    };
  }

  // Google Gemini API integration
  private async getGeminiResponse(message: string, userContext: UserContext): Promise<AIResponse> {
    if (!this.apiKeys.gemini) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = this.buildPrompt(message, userContext);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKeys.gemini}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      confidence: 0.9
    };
  }

  // Hugging Face API integration (free tier)
  private async getHuggingFaceResponse(message: string, userContext: UserContext): Promise<AIResponse> {
    if (!this.apiKeys.huggingface) {
      throw new Error('Hugging Face API key not configured');
    }

    const prompt = this.buildPrompt(message, userContext);
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.huggingface}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data[0]?.generated_text || 'I apologize, but I could not generate a response.',
      confidence: 0.7
    };
  }

  // Fallback response using local logic
  private async getFallbackResponse(message: string, userContext: UserContext): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = message.toLowerCase();
    const { profile, projects = [], tasks = [] } = userContext;

    // Handle casual greetings and general questions
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going') || 
        lowerMessage.includes('what\'s up') || lowerMessage.includes('good morning') || 
        lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
      return {
        content: `Hello! I'm your AI project management assistant. I'm here to help you with:

🎯 **Project Management Tasks:**
• Task prioritization and scheduling
• Time estimation and resource planning
• Progress tracking and milestone management
• Team collaboration and workflow optimization

📊 **Productivity Insights:**
• Work pattern analysis
• Efficiency recommendations
• Goal setting and tracking
• Performance optimization

🚀 **Quick Actions:**
• Create project timelines
• Suggest task breakdowns
• Identify bottlenecks
• Recommend productivity improvements

What would you like help with today? I can analyze your current projects, suggest next steps, or help you plan your work more effectively!`,
        suggestions: [
          'Help me prioritize my tasks',
          'Analyze my project timeline',
          'Suggest productivity improvements',
          'Create a work schedule'
        ],
        confidence: 0.9
      };
    }
    
    // Project management specific responses
    if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
      const activeProjects = projects.filter(p => p.status === 'active');
      const completedProjects = projects.filter(p => p.status === 'completed');
      
      return {
        content: `Here's an overview of your project portfolio:

📊 **Project Status:**
• Active Projects: ${activeProjects.length}
• Completed Projects: ${completedProjects.length}
• Total Projects: ${projects.length}

🎯 **Active Project Highlights:**
${activeProjects.slice(0, 3).map(p => `• ${p.name} - ${p.status} (${p.priority} priority)`).join('\n')}

📈 **Project Management Insights:**
• Your ${profile?.experience || 'mid-level'} experience level suggests you can handle ${activeProjects.length > 5 ? 'complex multi-project' : 'focused project'} management
• Consider using ${profile?.workPreferences?.workStyle || 'agile'} methodologies for better results
• Your ${profile?.personality?.workingStyle || 'results-driven'} approach is perfect for project delivery

💡 **Recommendations:**
• Set up weekly project reviews
• Use milestone tracking for better progress visibility
• Implement regular team check-ins for active projects`,
        suggestions: [
          'Create a project timeline',
          'Set up project milestones',
          'Analyze project performance',
          'Plan next project phase'
        ],
        confidence: 0.8
      };
    }

    // Task prioritization
    if (lowerMessage.includes('prioritize') || lowerMessage.includes('priority') || lowerMessage.includes('urgent')) {
      const activeTasks = tasks.filter(task => task.status !== 'completed');
      const urgentTasks = activeTasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
      
      return {
        content: `Based on your current workload and project context, here's my prioritization strategy:

🚨 **Urgent & High Priority:**
${urgentTasks.slice(0, 3).map(task => `• ${task.title} (Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'})`).join('\n')}

📋 **All Active Tasks (${activeTasks.length}):**
${activeTasks.slice(0, 5).map(task => `• ${task.title} - ${task.priority} priority`).join('\n')}

⏰ **Time Management Strategy:**
• Peak productivity hours: ${profile?.productivity?.peakHours?.[0]?.start || '9 AM'} - ${profile?.productivity?.peakHours?.[0]?.end || '5 PM'}
• Work style: ${profile?.workPreferences?.workStyle || 'Mixed'} approach
• Focus technique: ${profile?.productivity?.focusTechniques?.[0] || 'Pomodoro Technique'}

🎯 **Action Plan:**
1. Tackle urgent tasks first thing in the morning
2. Batch similar tasks together for efficiency
3. Schedule buffer time for unexpected issues
4. Review and adjust priorities daily`,
        suggestions: [
          'Create a daily task schedule',
          'Set up priority-based reminders',
          'Analyze task completion patterns',
          'Optimize my work routine'
        ],
        confidence: 0.8
      };
    }

    // Time estimation and scheduling
    if (lowerMessage.includes('time') || lowerMessage.includes('estimate') || lowerMessage.includes('duration') || 
        lowerMessage.includes('schedule') || lowerMessage.includes('timeline')) {
      const experienceLevel = profile?.experience || 'mid-level';
      const workStyle = profile?.workPreferences?.workStyle || 'mixed';
      
      return {
        content: `Based on your ${experienceLevel} experience and ${workStyle} work style, here's my time estimation framework:

⏱️ **Time Estimation Guidelines:**
• **Simple tasks** (emails, quick fixes): 30 minutes - 2 hours
• **Moderate tasks** (feature development): 1-3 days
• **Complex features** (new modules): 1-2 weeks
• **Large projects** (system overhauls): 2-8 weeks

📊 **Your Productivity Profile:**
• Experience Level: ${experienceLevel}
• Work Style: ${workStyle}
• Peak Hours: ${profile?.productivity?.peakHours?.[0]?.start || '9 AM'} - ${profile?.productivity?.peakHours?.[0]?.end || '5 PM'}
• Focus Techniques: ${profile?.productivity?.focusTechniques?.join(', ') || 'Pomodoro, Time blocking'}

🎯 **Estimation Factors:**
• **Complexity**: Technical difficulty and scope
• **Dependencies**: External team coordination needs
• **Learning curve**: New technologies or processes
• **Testing & QA**: Quality assurance requirements

💡 **Smart Scheduling Tips:**
• Add 25-40% buffer for unexpected issues
• Schedule complex tasks during peak hours
• Use time-blocking for focused work
• Plan for regular breaks and reviews`,
        suggestions: [
          'Create a detailed project timeline',
          'Break down this task into smaller parts',
          'Set up time tracking for this project',
          'Plan my weekly schedule'
        ],
        confidence: 0.8
      };
    }

    // Productivity insights and optimization
    if (lowerMessage.includes('productivity') || lowerMessage.includes('improve') || lowerMessage.includes('efficient') ||
        lowerMessage.includes('optimize') || lowerMessage.includes('better') || lowerMessage.includes('performance')) {
      const workStyle = profile?.workPreferences?.workStyle || 'Mixed';
      const communicationStyle = profile?.workPreferences?.communicationStyle || 'Direct';
      const timeManagement = profile?.workPreferences?.timeManagement || 'Structured';
      
      return {
        content: `Here's your personalized productivity optimization plan:

🚀 **Your Current Profile:**
• Work Style: ${workStyle}
• Communication: ${communicationStyle}
• Time Management: ${timeManagement}
• Experience Level: ${profile?.experience || 'mid-level'}

📈 **Optimization Strategies:**
• **Peak Performance**: Schedule complex tasks during ${profile?.productivity?.peakHours?.[0]?.start || '9 AM'} - ${profile?.productivity?.peakHours?.[0]?.end || '5 PM'}
• **Focus Environment**: Use ${profile?.productivity?.workEnvironment?.preferredEnvironment || 'moderate noise'} settings
• **Work Rhythm**: Leverage your ${profile?.personality?.workingStyle || 'results-driven'} approach
• **Communication**: Your ${communicationStyle} style works best with clear, direct feedback

🎯 **Skill Development Path:**
${profile?.learning?.interests?.length ? 
  `• Current focus: ${profile.learning.interests.slice(0, 3).join(', ')}\n• Learning style: ${profile?.learning?.learningStyle || 'hands-on'}` : 
  '• Explore new technologies in your field\n• Consider project management certifications'}

💡 **Quick Wins:**
• Set up daily standup meetings for better team sync
• Use time-blocking for different types of work
• Implement regular retrospectives for continuous improvement
• Track your energy levels throughout the day`,
        suggestions: [
          'Create a personalized work schedule',
          'Set up productivity tracking tools',
          'Plan my skill development roadmap',
          'Optimize my team communication'
        ],
        confidence: 0.8
      };
    }

    // Work pattern analysis and team management
    if (lowerMessage.includes('pattern') || lowerMessage.includes('analyze') || lowerMessage.includes('work style') ||
        lowerMessage.includes('team') || lowerMessage.includes('collaboration') || lowerMessage.includes('leadership')) {
      const stressLevel = profile?.personality?.stressLevel || 'Medium';
      const motivationFactors = profile?.personality?.motivationFactors?.join(', ') || 'Growth, Challenge, Recognition';
      const workingStyle = profile?.personality?.workingStyle || 'results-driven';
      
      return {
        content: `Here's your comprehensive work pattern and leadership analysis:

🔍 **Your Work Patterns:**
• **Stress Management**: ${stressLevel} stress tolerance
• **Motivation Drivers**: ${motivationFactors}
• **Working Style**: ${workingStyle}
• **Communication**: ${profile?.workPreferences?.communicationStyle || 'Direct and clear'}

📊 **Leadership Strengths:**
• Your ${workingStyle} approach drives results
• ${profile?.workPreferences?.communicationStyle || 'Direct'} communication builds trust
• ${profile?.workPreferences?.timeManagement || 'Structured'} approach ensures reliability
• Experience level: ${profile?.experience || 'mid-level'} with room for growth

🎯 **Team Management Insights:**
• **Delegation Style**: ${profile?.workPreferences?.delegationStyle || 'Clear instructions with regular check-ins'}
• **Feedback Approach**: ${profile?.workPreferences?.feedbackStyle || 'Constructive and regular'}
• **Conflict Resolution**: ${profile?.personality?.conflictResolution || 'Direct and solution-focused'}

💡 **Team Optimization Recommendations:**
• Set up regular 1:1s with team members
• Implement clear project communication channels
• Use your ${workingStyle} approach to drive team accountability
• Leverage your ${profile?.experience || 'mid-level'} experience to mentor junior team members`,
        suggestions: [
          'Create a team management strategy',
          'Set up regular team check-ins',
          'Develop my leadership skills',
          'Improve team communication'
        ],
        confidence: 0.8
      };
    }

    // Default response with enhanced project management focus
    return {
      content: `I understand you're asking about "${message}". As your AI project management assistant, I can help you with:

🎯 **Project Management:**
• Task prioritization and scheduling
• Project timeline creation and optimization
• Resource allocation and team coordination
• Risk assessment and mitigation planning

📊 **Productivity & Performance:**
• Work pattern analysis and optimization
• Time management and scheduling strategies
• Focus techniques and productivity tools
• Performance tracking and improvement

🚀 **Leadership & Team Management:**
• Team communication and collaboration
• Leadership development and mentoring
• Conflict resolution and team dynamics
• Delegation and accountability systems

📈 **Strategic Planning:**
• Goal setting and milestone tracking
• Skill development and career growth
• Process improvement and automation
• Decision making and problem solving

💡 **Quick Actions I Can Help With:**
• Create detailed project plans
• Suggest productivity improvements
• Analyze your work patterns
• Optimize team workflows
• Plan learning and development

What specific project management challenge would you like to tackle?`,
      suggestions: [
        'Help me plan my next project',
        'Analyze my team\'s productivity',
        'Create a project timeline',
        'Suggest workflow improvements',
        'Plan my professional development'
      ],
      confidence: 0.8
    };
  }

  // Build context-aware prompt
  private buildPrompt(message: string, userContext: UserContext): string {
    const { profile, projects = [], tasks = [] } = userContext;
    
    let contextInfo = `User Profile:
- Name: ${profile?.fullName || 'Unknown'}
- Job Title: ${profile?.jobTitle || 'Not specified'}
- Experience: ${profile?.experience || 'mid-level'}
- Work Style: ${profile?.workPreferences?.workStyle || 'mixed'}
- Skills: ${profile?.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}`;

    if (projects.length > 0) {
      contextInfo += `\n\nCurrent Projects (${projects.length}):
${projects.slice(0, 3).map(p => `- ${p.name} (${p.status})`).join('\n')}`;
    }

    if (tasks.length > 0) {
      const activeTasks = tasks.filter(t => t.status !== 'completed');
      contextInfo += `\n\nActive Tasks (${activeTasks.length}):
${activeTasks.slice(0, 5).map(t => `- ${t.title} (${t.priority})`).join('\n')}`;
    }

    return `${contextInfo}

User Question: ${message}

Please provide a helpful, actionable response based on the user's context and question. Focus on productivity, task management, and work optimization.`;
  }

  // Get available AI providers
  getAvailableProviders(): string[] {
    const providers = ['fallback'];
    
    if (this.apiKeys.openai) providers.push('openai');
    if (this.apiKeys.gemini) providers.push('gemini');
    if (this.apiKeys.huggingface) providers.push('huggingface');
    
    return providers;
  }

  // Test AI provider connection
  async testProvider(provider: 'openai' | 'gemini' | 'huggingface'): Promise<boolean> {
    try {
      await this.getAIResponse('Hello, can you help me?', {}, provider);
      return true;
    } catch (error) {
      console.error(`Provider ${provider} test failed:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
