import llmService from "./llmService";

interface AIResponse {
  content: string;
  suggestions?: string[];
  data?: any;
}

interface UserContext {
  profile?: any;
  projects?: any[];
  tasks?: any[];
  workspaces?: any[];
}

class AIService {
  /**
   * Main entry point for AI interactions
   */
  async getAIResponse(
    userMessage: string,
    userContext: UserContext,
    language?: string,
  ): Promise<AIResponse> {
    try {
      // Step 1: Recognize intent
      const intent = await llmService.recognizeIntent(userMessage);
      console.log(`Recognized intent: ${intent}`);

      // Step 2: Route based on intent
      switch (intent) {
        case "CREATE_PROJECT":
          return await this.handleCreateProject(userMessage);

        case "SUGGEST_MILESTONES_TASKS":
          return await this.handleSuggestMilestonesTasks(
            userMessage,
            userContext,
          );

        case "GET_PENDING_TASKS":
          return await this.handleGetPendingTasks(userContext);

        case "GET_MISSING_DEADLINES":
          return await this.handleGetMissingDeadlines(userContext);

        case "GET_WORKING_PROJECTS":
          return await this.handleGetWorkingProjects(userContext);

        case "GENERAL_QUERY":
          return await this.handleGeneralQuery(userMessage, userContext, language);

        default:
          // Try to handle common patterns even if intent recognition fails
          const message = userMessage.toLowerCase();
          if (message.includes('create') && (message.includes('project') || message.includes('new'))) {
            return await this.handleCreateProject(userMessage);
          } else if (message.includes('pending') || message.includes('tasks')) {
            return await this.handleGetPendingTasks(userContext);
          } else if (message.includes('milestone') || message.includes('suggest')) {
            return await this.handleSuggestMilestonesTasks(userMessage, userContext);
          } else if (message.includes('project') && (message.includes('working') || message.includes('current'))) {
            return await this.handleGetWorkingProjects(userContext);
          } else {
            return this.handleUnknownIntent();
          }
      }
    } catch (error: any) {
      console.error("Error in AIService.getAIResponse:", error);

      // Always provide helpful responses for project management queries
      const message = userMessage.toLowerCase();

      if (message.includes('create') && (message.includes('project') || message.includes('new'))) {
        return {
          content: `I'd be happy to help you create a new project! 🚀

Here's how to get started:

📋 **Project Creation Process:**
1. **Define your project scope** - What exactly do you want to achieve?
2. **Set clear objectives** - What are your success criteria?
3. **Estimate timeline** - When do you need this completed?
4. **Identify resources** - What team members and tools do you need?
5. **Plan milestones** - Break it down into manageable phases

💡 **Example Project Types:**
• Mobile app development
• Website redesign
• Marketing campaign
• Product launch
• Process improvement
• Team training program

Just tell me: "Create a [project type] project" and I'll help you structure it!`,
          suggestions: [
            "Create a mobile app project",
            "Create a website project",
            "Create a marketing campaign",
            "Create a team training project"
          ]
        };
      } else if (message.includes('pending') || message.includes('tasks') || message.includes('workload')) {
        return {
          content: `I can definitely help you manage your tasks and workload! 📊

**Task Management Strategies:**

🎯 **Priority Matrix (Eisenhower Matrix):**
• **Urgent + Important** - Do these first
• **Important + Not Urgent** - Schedule these
• **Urgent + Not Important** - Delegate if possible
• **Not Urgent + Not Important** - Consider eliminating

📋 **Task Organization Tips:**
• Break large tasks into smaller, actionable items
• Set realistic deadlines with buffer time
• Use the 2-minute rule: if it takes less than 2 minutes, do it now
• Batch similar tasks together
• Review and adjust priorities daily

💡 **Quick Actions:**
• "Help me prioritize my tasks"
• "Create a task list for [project]"
• "How do I manage my time better?"
• "Show me productivity techniques"

What specific aspect of task management would you like help with?`,
          suggestions: [
            "Help me prioritize my tasks",
            "Create a task list",
            "How do I manage my time better?",
            "Show me productivity techniques"
          ]
        };
      } else if (message.includes('project') || message.includes('manage') || message.includes('organize') ||
        message.includes('plan') || message.includes('deadline') || message.includes('team')) {
        return {
          content: `I'm your dedicated project management assistant! Here's how I can help you succeed:

🎯 **Project Management Expertise:**
• **Project Planning** - From concept to completion
• **Task Breakdown** - Turning big ideas into actionable steps
• **Timeline Management** - Realistic scheduling and deadline tracking
• **Team Coordination** - Effective collaboration strategies
• **Risk Management** - Identifying and mitigating potential issues

📊 **Management Methodologies:**
• **Agile** - Iterative development with regular feedback
• **Waterfall** - Sequential phases with clear milestones
• **Scrum** - Sprint-based development with daily standups
• **Kanban** - Visual workflow management
• **Hybrid** - Combining methodologies for your specific needs

💡 **Quick Help Commands:**
• "Create a [project type] project"
• "Help me plan my project timeline"
• "How do I manage my team effectively?"
• "What are the best project management tools?"
• "Help me identify project risks"

What project management challenge can I help you solve today?`,
          suggestions: [
            "Create a new project",
            "Help me plan my timeline",
            "How do I manage my team?",
            "What tools should I use?",
            "Help me identify risks"
          ]
        };
      } else {
        return {
          content: `I'm your AI project management assistant, and I'm here to help you succeed! 🚀

**What I Can Do For You:**

🎯 **Project Management**
• Create and structure projects from your ideas
• Break down complex projects into manageable tasks
• Suggest realistic timelines and milestones
• Help you choose the right methodology

📊 **Task & Time Management**
• Organize your daily tasks effectively
• Prioritize work using proven frameworks
• Manage deadlines and avoid burnout
• Improve your productivity and focus

👥 **Team & Leadership**
• Build effective team collaboration
• Manage workloads and assignments
• Improve communication strategies
• Develop leadership skills

💡 **Best Practices & Tools**
• Industry-standard project management techniques
• Tool recommendations for different needs
• Risk management and contingency planning
• Performance tracking and reporting

**Ready to get started?** Just tell me what you'd like help with!`,
          suggestions: [
            "Create a new project",
            "Help me organize my work",
            "What are best practices?",
            "Show me productivity tips",
            "How do I manage my team?"
          ],
        };
      }
    }
  }

  /**
   * Handle CREATE_PROJECT intent
   */
  private async handleCreateProject(userMessage: string): Promise<AIResponse> {
    const projectDetails =
      await llmService.generateProjectFromNaturalLanguage(userMessage);

    if ("error" in projectDetails) {
      return {
        content: projectDetails.error,
        suggestions: [
          "Try describing the project differently",
          "Tell me more about the project goals",
          "What type of project is it?",
        ],
      };
    }

    const content = `Okay, I've drafted a project for you:

**Project Name:** ${projectDetails.projectName}
**Description:** ${projectDetails.projectDescription}
**Type:** ${projectDetails.projectType}
**Category:** ${projectDetails.projectCategory}
**Priority:** ${projectDetails.priorityLevel}

Does this look right? Would you like me to suggest some milestones and tasks for this project?`;

    return {
      content,
      suggestions: [
        "Yes, suggest milestones and tasks!",
        "Edit project details",
        "Change the priority level",
        "Save this project",
      ],
      data: {
        projectDetails,
        intent: "CREATE_PROJECT",
      },
    };
  }

  /**
   * Handle SUGGEST_MILESTONES_TASKS intent
   */
  private async handleSuggestMilestonesTasks(
    userMessage: string,
    userContext: UserContext,
  ): Promise<AIResponse> {
    // Try to extract project info from message or use most recent project
    let projectName = "Your Project";
    let projectDescription = "A project you are working on";

    // Check if user has any projects in context
    if (userContext.projects && userContext.projects.length > 0) {
      const recentProject =
        userContext.projects[userContext.projects.length - 1];
      projectName = recentProject.name || projectName;
      projectDescription = recentProject.description || projectDescription;
    }

    // Try to extract project details from user message using LLM
    const extractionPrompt = `Extract the project name and description from this message. If not found, return "NOT_FOUND".
Message: "${userMessage}"
Return only JSON: {"projectName": "string", "projectDescription": "string"} or "NOT_FOUND"`;

    try {
      const extracted =
        await llmService.generateGeneralResponse(extractionPrompt);
      const parsedExtraction = JSON.parse(extracted);
      if (
        parsedExtraction.projectName &&
        parsedExtraction.projectName !== "NOT_FOUND"
      ) {
        projectName = parsedExtraction.projectName;
        projectDescription =
          parsedExtraction.projectDescription || projectDescription;
      }
    } catch (e) {
      // Continue with default values
    }

    const milestonesData = await llmService.generateMilestonesAndTasks(
      projectName,
      projectDescription,
    );

    if ("error" in milestonesData) {
      return {
        content: milestonesData.error,
        suggestions: [
          "Try again with more details",
          "Create a new project first",
          "Tell me about the project goals",
        ],
      };
    }

    let content = `Here are some suggested milestones and tasks for "${projectName}":\n\n`;

    milestonesData.forEach((milestoneData, index) => {
      content += `**${index + 1}. ${milestoneData.milestone}**\n`;
      milestoneData.tasks.forEach((task) => {
        content += `   • ${task}\n`;
      });
      content += "\n";
    });

    return {
      content,
      suggestions: [
        "Add these to my project",
        "Generate more detailed tasks",
        "Suggest different milestones",
        "Create a timeline for these",
      ],
      data: {
        milestones: milestonesData,
        projectName,
        intent: "SUGGEST_MILESTONES_TASKS",
      },
    };
  }

  /**
   * Handle GET_PENDING_TASKS intent
   */
  private async handleGetPendingTasks(
    userContext: UserContext,
  ): Promise<AIResponse> {
    const tasks = userContext.tasks || [];
    const pendingTasks = tasks.filter(
      (task: any) => task.status !== "completed" && task.status !== "cancelled",
    );

    if (pendingTasks.length === 0) {
      return {
        content:
          "Great news! You don't have any pending tasks at the moment. Keep up the excellent work! 🎉",
        suggestions: [
          "Show all my tasks",
          "Create a new task",
          "What are my upcoming deadlines?",
          "Show my projects",
        ],
      };
    }

    let content = `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? "s" : ""}:\n\n`;

    // Sort by priority and due date
    const sortedTasks = pendingTasks
      .sort((a: any, b: any) => {
        const priorityOrder: any = { high: 0, medium: 1, low: 2 };
        return (
          (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
        );
      })
      .slice(0, 10); // Show top 10

    sortedTasks.forEach((task: any, index: number) => {
      const priority = task.priority || "medium";
      const priorityEmoji =
        priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "🟢";
      const dueDate = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : "No due date";

      content += `${index + 1}. ${priorityEmoji} **${task.title || task.name}**\n`;
      content += `   Status: ${task.status || "pending"} | Due: ${dueDate}\n\n`;
    });

    if (pendingTasks.length > 10) {
      content += `... and ${pendingTasks.length - 10} more tasks.\n`;
    }

    return {
      content,
      suggestions: [
        "Help me prioritize these tasks",
        "Show overdue tasks",
        "Filter by high priority",
        "Show task details",
      ],
    };
  }

  /**
   * Handle GET_MISSING_DEADLINES intent
   */
  private async handleGetMissingDeadlines(
    userContext: UserContext,
  ): Promise<AIResponse> {
    const tasks = userContext.tasks || [];
    const now = new Date();

    const overdueTasks = tasks.filter((task: any) => {
      if (
        !task.dueDate ||
        task.status === "completed" ||
        task.status === "cancelled"
      ) {
        return false;
      }
      return new Date(task.dueDate) < now;
    });

    if (overdueTasks.length === 0) {
      return {
        content:
          "Excellent! All your deadlines are on track. You're doing great! 🎯",
        suggestions: [
          "Show upcoming deadlines",
          "Show my pending tasks",
          "Help me plan next week",
          "Analyze my productivity",
        ],
      };
    }

    let content = `⚠️ You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}:\n\n`;

    overdueTasks.slice(0, 10).forEach((task: any, index: number) => {
      const dueDate = new Date(task.dueDate);
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      content += `${index + 1}. **${task.title || task.name}**\n`;
      content += `   Overdue by: ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} (Due: ${dueDate.toLocaleDateString()})\n\n`;
    });

    return {
      content,
      suggestions: [
        "Help me reschedule these",
        "Prioritize overdue tasks",
        "Send reminders to team",
        "Mark as completed",
      ],
    };
  }

  /**
   * Handle GET_WORKING_PROJECTS intent
   */
  private async handleGetWorkingProjects(
    userContext: UserContext,
  ): Promise<AIResponse> {
    const projects = userContext.projects || [];
    const activeProjects = projects.filter(
      (project: any) =>
        project.status === "active" ||
        project.status === "in-progress" ||
        project.status === "in_progress",
    );

    if (activeProjects.length === 0) {
      return {
        content:
          "You don't have any active projects at the moment. Would you like to create a new one?",
        suggestions: [
          "Create a new project",
          "Show all projects",
          "Show completed projects",
          "View project templates",
        ],
      };
    }

    let content = `You are currently working on ${activeProjects.length} project${activeProjects.length > 1 ? "s" : ""}:\n\n`;

    activeProjects.slice(0, 10).forEach((project: any, index: number) => {
      const progress = project.progress || 0;
      const progressBar = this.generateProgressBar(progress);

      content += `${index + 1}. **${project.name}**\n`;
      content += `   Status: ${project.status} | Progress: ${progressBar} ${progress}%\n`;
      if (project.description) {
        content += `   ${project.description.substring(0, 80)}${project.description.length > 80 ? "..." : ""}\n`;
      }
      content += "\n";
    });

    return {
      content,
      suggestions: [
        "Show project details",
        "Suggest tasks for a project",
        "Show project timeline",
        "Update project status",
      ],
    };
  }

  /**
   * Handle GENERAL_QUERY intent
   */
  private async handleGeneralQuery(
    userMessage: string,
    userContext: UserContext,
    language?: string,
  ): Promise<AIResponse> {
    try {
      // Map language codes to full names
      const languageMap: Record<string, string> = {
        'en': 'English',
        'ja': 'Japanese',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'hi': 'Hindi',
        'ko': 'Korean',
        'mr': 'Marathi',
        'pt': 'Portuguese',
        'da': 'Danish',
        'nl': 'Dutch',
        'fi': 'Finnish',
        'no': 'Norwegian',
        'sv': 'Swedish'
      };

      const languageName = language ? (languageMap[language] || language) : undefined;

      // Build context string
      const contextInfo = this.buildContextString(userContext);
      const response = await llmService.generateGeneralResponse(
        userMessage,
        contextInfo,
        language
      );

      // Get suggestions in the appropriate language
      const suggestionPrompt = languageName
        ? `Provide 4 short follow-up suggestions in ${languageName} language for a project management assistant. Return only a JSON array of strings, nothing else. Example: ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]`
        : `Provide 4 short follow-up suggestions for a project management assistant. Return only a JSON array of strings, nothing else.`;

      let suggestions = [
        "Create a new project",
        "Show my tasks",
        "Help me organize my work",
        "Analyze my productivity"
      ];

      try {
        const suggestionsResponse = await llmService.generateGeneralResponse(suggestionPrompt, "", language);
        const parsedSuggestions = JSON.parse(suggestionsResponse.replace(/```json\n?|\n?```/g, '').trim());
        if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
          suggestions = parsedSuggestions.slice(0, 4);
        }
      } catch (e) {
        // Use default suggestions if parsing fails
        console.error("Failed to parse suggestions:", e);
      }

      return {
        content: response,
        suggestions
      };
    } catch (error: any) {
      console.error("Error in handleGeneralQuery:", error);
      console.error("Error stack:", error.stack);
      console.error("Error message:", error.message);

      // Always provide helpful responses for project management queries
      const message = userMessage.toLowerCase();

      if (message.includes('project') || message.includes('task') || message.includes('work') ||
        message.includes('manage') || message.includes('organize') || message.includes('plan') ||
        message.includes('deadline') || message.includes('priority') || message.includes('team') ||
        message.includes('productivity') || message.includes('schedule') || message.includes('timeline')) {

        return {
          content: `I'm here to help with your project management needs! Based on your question about "${userMessage}", here are some ways I can assist you:

🎯 **Project Management Help:**
• Create and organize projects effectively
• Break down projects into manageable tasks and milestones
• Track progress and meet deadlines
• Prioritize your work for maximum efficiency
• Manage team collaboration and communication

💡 **Quick Actions You Can Take:**
• Say "Create a [project type] project" to get started
• Ask "What are my pending tasks?" to see your current workload
• Request "Help me prioritize" for guidance on what to focus on
• Try "Suggest milestones for [project name]" for project planning

🚀 **Best Practices I Can Share:**
• Use the SMART goal framework (Specific, Measurable, Achievable, Relevant, Time-bound)
• Break large projects into smaller, manageable chunks
• Set realistic deadlines and build in buffer time
• Regular progress reviews and team check-ins
• Use project management tools to stay organized

What specific aspect of project management would you like help with?`,
          suggestions: [
            "Create a new project",
            "Help me organize my tasks",
            "What should I prioritize today?",
            "Show me project templates",
            "How do I manage deadlines better?"
          ]
        };
      }

      return {
        content: `I'm your AI project management assistant! I can help you with:

📋 **Project Creation & Planning**
• Create projects from your ideas and requirements
• Suggest detailed milestones and tasks
• Estimate timelines and resource requirements
• Choose the right project management methodology

📊 **Task Management & Organization**
• Organize and prioritize tasks effectively
• Track progress and identify bottlenecks
• Manage team workloads and assignments
• Set up automated reminders and notifications

🎯 **Productivity & Best Practices**
• Time management strategies that work
• Team collaboration techniques
• Risk management and contingency planning
• Performance tracking and reporting

💼 **Professional Development**
• Project management certifications guidance
• Leadership skills for project managers
• Communication strategies for stakeholders
• Tools and software recommendations

What would you like help with today? I'm here to make your project management journey smoother and more successful!`,
        suggestions: [
          "Generate Smart Summary",
          "Analyze Project Status",
          "Extract Smart Fields",
          "Show me productivity tips",
          "How do I manage my team better?"
        ]
      };
    }
  }

  /**
   * Handle UNKNOWN intent
   */
  private handleUnknownIntent(): AIResponse {
    return {
      content: `I'm your AI project management assistant! I can help you with:

🎯 **Core Project Management:**
• Creating and organizing projects
• Breaking down projects into tasks and milestones
• Setting realistic deadlines and priorities
• Tracking progress and managing workflows

📊 **Task & Team Management:**
• Organizing your daily tasks effectively
• Managing team workloads and assignments
• Identifying bottlenecks and resolving issues
• Improving team collaboration and communication

💡 **Productivity & Best Practices:**
• Time management strategies that actually work
• Project management methodologies (Agile, Waterfall, etc.)
• Risk management and contingency planning
• Performance tracking and reporting

🚀 **Quick Actions:**
• "Create a [project type] project" - Start a new project
• "What are my pending tasks?" - See your current workload
• "Help me prioritize" - Get guidance on what to focus on
• "Suggest milestones for [project]" - Plan your project structure

What would you like help with today?`,
      suggestions: [
        "Create a new project",
        "What are my pending tasks?",
        "Help me organize my work",
        "Show me productivity tips",
        "How do I manage deadlines better?"
      ],
    };
  }

  /**
   * Build context string from user context
   */
  private buildContextString(userContext: UserContext): string {
    let context = "";

    if (userContext.profile) {
      context += `User: ${userContext.profile.fullName || "User"}. `;
    }

    if (userContext.projects && userContext.projects.length > 0) {
      context += `Active projects: ${userContext.projects.length}. `;
    }

    if (userContext.tasks && userContext.tasks.length > 0) {
      const pendingCount = userContext.tasks.filter(
        (t: any) => t.status !== "completed" && t.status !== "cancelled",
      ).length;
      context += `Pending tasks: ${pendingCount}. `;
    }

    return context;
  }

  /**
   * Generate a visual progress bar
   */
  private generateProgressBar(progress: number): string {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }
}

export const aiService = new AIService();
export default aiService;
