import axios from 'axios';

/**
 * Meeting Notes AI Service
 * Processes meeting transcripts using DeepSeek AI to extract structured information
 */

interface MeetingAnalysis {
    summary: string;
    agendaItems: string[];
    decisions: string[];
    actionItems: Array<{
        task: string;
        assignee: string;
        priority: 'High' | 'Medium' | 'Low';
    }>;
}

interface ErrorResponse {
    error: string;
}

interface DeepSeekResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

class DeepSeekMeetingService {
    private apiKey: string;
    private apiUrl: string = 'https://api.deepseek.com/v1/chat/completions';

    constructor() {
        // Use a fallback empty string instead of throwing immediately to prevent server startup crash
        const apiKey = process.env.DEEPSEEK_API_KEY || '';

        if (!apiKey) {
            console.warn('⚠️ DEEPSEEK_API_KEY is not set in environment variables. DeepSeek meeting features will be disabled.');
            // Do NOT throw error here, as it crashes the entire server
        }

        this.apiKey = apiKey;
    }

    /**
     * Process a meeting transcript and extract structured information
     * @param transcriptText - The raw meeting transcript
     * @returns Structured meeting analysis or error
     */
    async processMeetingTranscript(
        transcriptText: string
    ): Promise<MeetingAnalysis | ErrorResponse> {
        try {
            // Check if API key is configured
            if (!this.apiKey) {
                return {
                    error: 'DeepSeek API key is not configured. Please contact the administrator to enable AI meeting features.',
                };
            }

            // Validate input
            if (!transcriptText || transcriptText.trim().length === 0) {
                return {
                    error: 'Transcript cannot be empty. Please provide a valid meeting transcript.',
                };
            }

            if (transcriptText.trim().length < 50) {
                return {
                    error: 'Transcript is too short. Please provide a more detailed meeting transcript (at least 50 characters).',
                };
            }

            // System prompt for meeting analysis
            const systemPrompt = `You are an expert Project Manager AI assistant specialized in analyzing meeting transcripts.

Your task is to analyze the following meeting transcript and extract structured information.

IMPORTANT: Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO backticks. Just pure JSON.

The JSON object must have these exact keys:
- "summary": A concise executive summary of the meeting (2-3 sentences)
- "agendaItems": An array of strings listing the main topics discussed
- "decisions": An array of strings listing key decisions that were made
- "actionItems": An array of objects, each with:
  - "task": The specific action item or task
  - "assignee": The person responsible (use "Unassigned" if not mentioned)
  - "priority": Either "High", "Medium", or "Low" based on urgency/importance

Guidelines:
- Be concise and clear
- Extract only factual information from the transcript
- If no decisions were made, return an empty array for "decisions"
- If no action items were identified, return an empty array for "actionItems"
- Infer priority based on context (deadlines, urgency words, importance)
- If multiple people are mentioned for a task, list the primary person

Example output format:
{
  "summary": "The team discussed Q4 roadmap priorities and assigned key deliverables.",
  "agendaItems": ["Q4 Roadmap Review", "Resource Allocation", "Timeline Discussion"],
  "decisions": ["Approved budget increase for marketing", "Decided to use React for frontend"],
  "actionItems": [
    {
      "task": "Complete API documentation",
      "assignee": "Sarah",
      "priority": "High"
    },
    {
      "task": "Review design mockups",
      "assignee": "John",
      "priority": "Medium"
    }
  ]
}

Now analyze this meeting transcript:

${transcriptText}`;

            // Call DeepSeek API
            const requestBody = {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: systemPrompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2048,
            };

            const response = await axios.post<DeepSeekResponse>(
                this.apiUrl,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    timeout: 30000,
                }
            );

            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from DeepSeek API');
            }

            const choice = response.data.choices[0];
            if (!choice || !choice.message || !choice.message.content) {
                throw new Error('Invalid response structure from DeepSeek API');
            }

            const text = choice.message.content;

            // Clean up the response (remove markdown code blocks if present)
            let cleanedText = text.trim();

            // Remove markdown code blocks
            cleanedText = cleanedText.replace(/```json\n?/g, '');
            cleanedText = cleanedText.replace(/```\n?/g, '');
            cleanedText = cleanedText.trim();

            // Parse JSON
            let parsedData: MeetingAnalysis;
            try {
                parsedData = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error('Failed to parse DeepSeek response:', cleanedText);
                console.error('Parse error:', parseError);

                // Return a fallback response
                return {
                    error: 'Failed to parse AI response. Please try again with a clearer transcript.',
                };
            }

            // Validate the structure
            if (!this.isValidMeetingAnalysis(parsedData)) {
                console.error('Invalid meeting analysis structure:', parsedData);
                return {
                    error: 'AI returned invalid data structure. Please try again.',
                };
            }

            return parsedData;
        } catch (error: any) {
            console.error('Error processing meeting transcript:', error);

            // Handle specific error types
            if (error.message?.includes('API key')) {
                return {
                    error: 'AI service configuration error. Please contact support.',
                };
            }

            if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
                return {
                    error: 'AI service is temporarily unavailable due to high demand. Please try again in a few moments.',
                };
            }

            return {
                error: 'An unexpected error occurred while processing the transcript. Please try again.',
            };
        }
    }

    /**
     * Validate the structure of the meeting analysis
     */
    private isValidMeetingAnalysis(data: any): data is MeetingAnalysis {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check required fields
        if (typeof data.summary !== 'string') {
            return false;
        }

        if (!Array.isArray(data.agendaItems)) {
            return false;
        }

        if (!Array.isArray(data.decisions)) {
            return false;
        }

        if (!Array.isArray(data.actionItems)) {
            return false;
        }

        // Validate action items structure
        for (const item of data.actionItems) {
            if (
                typeof item.task !== 'string' ||
                typeof item.assignee !== 'string' ||
                !['High', 'Medium', 'Low'].includes(item.priority)
            ) {
                return false;
            }
        }

        return true;
    }
}

// Export singleton instance
export const deepSeekMeetingService = new DeepSeekMeetingService();
export default deepSeekMeetingService;
