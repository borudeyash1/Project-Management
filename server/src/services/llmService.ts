import axios from "axios";

interface ProjectDetails {
  projectName: string;
  projectDescription: string;
  projectType: string;
  projectCategory: string;
  priorityLevel: string;
}

interface MilestoneTask {
  milestone: string;
  tasks: string[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class LLMService {
  private apiKey: string;
  private apiUrl: string =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  constructor() {
    this.apiKey = "";
  }

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.GEMINI_API_KEY || "";
      if (!this.apiKey) {
        console.warn(
          "Warning: GEMINI_API_KEY not found in environment variables",
        );
      }
    }
    return this.apiKey;
  }

  /**
   * Generate project details from natural language input
   */
  async generateProjectFromNaturalLanguage(
    userRequest: string,
  ): Promise<ProjectDetails | { error: string }> {
    const prompt = `
You are an expert project manager AI. Your task is to interpret a user's natural language request for a new project and extract the necessary details to create a project, strictly following the provided JSON schema. Do not include any fields not explicitly mentioned in the schema.

User Request: "${userRequest}"

Please provide a JSON object with the following project details. Only output the JSON and nothing else.

JSON Schema:
{
    "projectName": "string",
    "projectDescription": "string",
    "projectType": "string",
    "projectCategory": "string",
    "priorityLevel": "string"
}

Guidelines for filling fields:
- projectName: A concise, descriptive name for the project.
- projectDescription: A brief but informative description of the project's goal and scope.
- projectType: Examples: "Software Development", "Marketing Campaign", "Research", "Event Planning", "Product Launch", "Internal Improvement". Choose the most appropriate from context. If not clear, default to "General".
- projectCategory: Examples: "Frontend", "Backend", "Mobile", "Web", "UI/UX", "Social Media", "Content", "SEO", "Market Research", "Product". Choose the most appropriate. If not clear, default to "General".
- priorityLevel: "High", "Medium", "Low". Infer from the urgency or importance implied in the request. If not specified, default to "Medium".

Example of desired output:
{
    "projectName": "Mobile App Launch",
    "projectDescription": "Launch a new mobile application to market, covering development, marketing, and operational readiness.",
    "projectType": "Product Launch",
    "projectCategory": "Mobile",
    "priorityLevel": "High"
}
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const projectData = this.parseJSONResponse(response);

      // Validate that all required fields are present
      if (this.isValidProjectDetails(projectData)) {
        return projectData as ProjectDetails;
      } else {
        return { error: "Invalid project data structure received from AI" };
      }
    } catch (error: any) {
      console.error("Error generating project:", error.message);
      return {
        error:
          "Could not generate project details. Please try again or rephrase.",
      };
    }
  }

  /**
   * Generate milestones and tasks for a project
   */
  async generateMilestonesAndTasks(
    projectName: string,
    projectDescription: string,
  ): Promise<MilestoneTask[] | { error: string }> {
    const prompt = `
You are an expert project manager AI. Given a project name and description, your task is to suggest a structured list of milestones and their associated tasks. Each task must be a collection of small milestones as per the project's definition.

Project Name: "${projectName}"
Project Description: "${projectDescription}"

Please provide a JSON array of objects, where each object represents a milestone and contains a 'milestone' field (string) and a 'tasks' field (array of strings). Only output the JSON array and nothing else.

JSON Schema for output:
[
    {
        "milestone": "string",
        "tasks": ["string", "string", ...]
    }
]

Guidelines:
- Suggest 3-5 high-level milestones for the project.
- For each milestone, suggest 2-5 concrete, actionable tasks.
- Tasks should be distinct steps required to achieve the milestone.
- Ensure the hierarchy is Project -> Milestones -> Tasks.

Example of desired output for a "Mobile App Launch" project:
[
    {
        "milestone": "Phase 1: Planning & Design",
        "tasks": [
            "Define app features and user stories",
            "Create UI/UX wireframes and mockups",
            "Develop technical architecture document"
        ]
    },
    {
        "milestone": "Phase 2: Development & Testing",
        "tasks": [
            "Implement frontend user interface",
            "Develop backend API and database",
            "Conduct unit and integration testing",
            "Perform user acceptance testing"
        ]
    },
    {
        "milestone": "Phase 3: Launch & Post-Launch",
        "tasks": [
            "Prepare app store listings and marketing materials",
            "Execute app store submission process",
            "Monitor app performance and user feedback",
            "Plan for post-launch updates and maintenance"
        ]
    }
]
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const milestonesData = this.parseJSONResponse(response);

      // Validate that the response is an array
      if (
        Array.isArray(milestonesData) &&
        this.isValidMilestoneArray(milestonesData)
      ) {
        return milestonesData as MilestoneTask[];
      } else {
        return { error: "Invalid milestone data structure received from AI" };
      }
    } catch (error: any) {
      console.error("Error generating milestones and tasks:", error.message);
      return {
        error: "Could not generate milestones and tasks. Please try again.",
      };
    }
  }

  /**
   * Recognize the intent of a user message
   */
  async recognizeIntent(userMessage: string): Promise<string> {
    const prompt = `
You are an AI assistant for a project management system. Classify the user's request into one of the following intents:
"CREATE_PROJECT", "SUGGEST_MILESTONES_TASKS", "GET_PENDING_TASKS", "GET_MISSING_DEADLINES", "GET_WORKING_PROJECTS", "GENERAL_QUERY", "UNKNOWN".

Only output the intent name in uppercase, nothing else.

Examples:
User Query: "I need a marketing project for the new website."
Intent: CREATE_PROJECT

User Query: "What should the milestones be for my new app project?"
Intent: SUGGEST_MILESTONES_TASKS

User Query: "What are my pending tasks?"
Intent: GET_PENDING_TASKS

User Query: "Show me projects with missing deadlines"
Intent: GET_MISSING_DEADLINES

User Query: "What projects am I currently working on?"
Intent: GET_WORKING_PROJECTS

User Query: "Hello, how are you?"
Intent: GENERAL_QUERY

User Query: "${userMessage}"
Intent:`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const intent = response.trim().toUpperCase();

      const validIntents = [
        "CREATE_PROJECT",
        "SUGGEST_MILESTONES_TASKS",
        "GET_PENDING_TASKS",
        "GET_MISSING_DEADLINES",
        "GET_WORKING_PROJECTS",
        "GENERAL_QUERY",
        "UNKNOWN",
      ];

      if (validIntents.includes(intent)) {
        return intent;
      }
      return "UNKNOWN";
    } catch (error: any) {
      console.error("Error recognizing intent:", error.message);
      return "UNKNOWN";
    }
  }

  /**
   * Generate a general conversational response
   */
  async generateGeneralResponse(
    userMessage: string,
    context?: string,
  ): Promise<string> {
    const prompt = `
You are an AI assistant for a project management platform. Help users with their questions and provide helpful, professional, and concise responses.

${context ? `Context: ${context}\n` : ""}
User: "${userMessage}"
AI Assistant:`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response;
    } catch (error: any) {
      console.error("Error generating general response:", error.message);
      return "I'm sorry, I couldn't process that request. Please try again.";
    }
  }

  /**
   * Call the Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured");
    }

    const url = `${this.apiUrl}?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    try {
      const response = await axios.post<GeminiResponse>(url, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];

        const firstPart = candidate?.content?.parts?.[0];
        if (firstPart && typeof firstPart.text === "string") {
          return firstPart.text;
        }
      }
      throw new Error("No response from Gemini API");
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || "Unknown error"}`,
        );
      } else if (error.request) {
        throw new Error("No response received from Gemini API");
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Parse JSON from AI response, handling markdown code blocks
   */
  private parseJSONResponse(response: string): any {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();

      // Remove ```json and ``` markers
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, "");
      cleanedResponse = cleanedResponse.replace(/```\s*/g, "");

      // Try to find JSON object or array in the response
      const jsonMatch = cleanedResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedResponse = jsonMatch[1];
      }

      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Invalid JSON response from AI");
    }
  }

  /**
   * Validate project details structure
   */
  private isValidProjectDetails(data: any): boolean {
    return (
      data &&
      typeof data === "object" &&
      typeof data.projectName === "string" &&
      typeof data.projectDescription === "string" &&
      typeof data.projectType === "string" &&
      typeof data.projectCategory === "string" &&
      typeof data.priorityLevel === "string"
    );
  }

  /**
   * Validate milestone array structure
   */
  private isValidMilestoneArray(data: any): boolean {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    return data.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.milestone === "string" &&
        Array.isArray(item.tasks) &&
        item.tasks.every((task: any) => typeof task === "string")
      );
    });
  }
}

export const llmService = new LLMService();
export default llmService;
