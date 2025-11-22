/**
 * AI Service for communicating with backend AI API using native fetch.
 * - Uses a small request helper with timeout and error handling
 * - Reads base URL from REACT_APP_API_URL
 */

type JsonObject = Record<string, any>;

interface AIResponse {
  content: string;
  suggestions?: string[];
  confidence?: number;
  data?: any;
}

type UserContext = Record<string, any>;

class AIService {
  private baseURL: string;
  private defaultTimeout = 30000; // 30 seconds

  constructor() {
    // Use REACT_APP_API_URL if provided, otherwise default to /api for production
    const envBase = process.env.REACT_APP_API_URL;
    // Remove trailing /api if present since we'll add full paths
    const cleanBase =
      envBase && envBase.trim().length > 0
        ? envBase.replace(/\/api\/?$/, "")
        : "";
    this.baseURL = cleanBase;
  }

  // Generic JSON request helper with timeout and consistent error handling
  private async request<T = any>(
    path: string,
    options: RequestInit = {},
    timeoutMs: number = this.defaultTimeout,
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
      const body = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const serverMessage =
          (isJson && (body?.message || body?.error)) ||
          `${res.status} ${res.statusText}`;
        throw new Error(serverMessage);
      }

      return body as T;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new Error(
          "Request timeout - AI service is taking too long to respond",
        );
      }
      throw new Error(err?.message || "An unexpected network error occurred");
    } finally {
      clearTimeout(id);
    }
  }

  /**
   * Main method to get AI response from backend
   */
  async getAIResponse(
    message: string,
    userContext: UserContext,
  ): Promise<AIResponse> {
    const payload = { message, userContext };

    const res = await this.request<{
      success: boolean;
      data?: AIResponse;
      message?: string;
    }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res?.success && res.data) return res.data;

    throw new Error(res?.message || "Failed to get AI response");
  }

  /**
   * Create a project from natural language description
   */
  async createProjectFromDescription(description: string): Promise<AIResponse> {
    const res = await this.request<{
      success: boolean;
      data?: AIResponse;
      message?: string;
    }>("/api/ai/projects/create", {
      method: "POST",
      body: JSON.stringify({ description }),
    });

    if (res?.success && res.data) return res.data;

    throw new Error(
      res?.message || "Failed to create project from description",
    );
  }

  /**
   * Suggest milestones and tasks for a project
   */
  async suggestMilestonesAndTasks(
    projectName: string,
    projectDescription: string,
  ): Promise<AIResponse> {
    const res = await this.request<{
      success: boolean;
      data?: AIResponse;
      message?: string;
    }>("/api/ai/milestones/suggest", {
      method: "POST",
      body: JSON.stringify({ projectName, projectDescription }),
    });

    if (res?.success && res.data) return res.data;

    throw new Error(res?.message || "Failed to suggest milestones and tasks");
  }

  /**
   * Check AI service health
   */
  async checkHealth(): Promise<{
    status: string;
    aiConfigured: boolean;
    timestamp: string;
  }> {
    const res = await this.request<{
      success: boolean;
      data?: JsonObject;
      message?: string;
    }>("/api/ai/health", { method: "GET" }, 5000);

    if (res?.success && res.data) {
      const {
        status = "unknown",
        aiConfigured = false,
        timestamp = new Date().toISOString(),
      } = res.data;
      return { status, aiConfigured, timestamp };
    }

    return {
      status: "error",
      aiConfigured: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get available AI providers (for backward compatibility)
   */
  getAvailableProviders(): string[] {
    return ["backend-ai"]; // Backend is the single provider now
  }

  /**
   * Test provider connection
   */
  async testProvider(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === "operational" && !!health.aiConfigured;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
