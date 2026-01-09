// AI Model Configuration
export interface AIModel {
    id: string;
    name: string;
    provider: 'deepseek' | 'openai' | 'anthropic';
    creditCost: number;
    description: string;
    tier: 'free' | 'pro' | 'ultra';
    enabled: boolean;
}

export const AI_MODELS: AIModel[] = [
    {
        id: 'deepseek-chat',
        name: 'DeepSeek',
        provider: 'deepseek',
        creditCost: 15,
        description: 'Fast and efficient AI model',
        tier: 'pro',
        enabled: true
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        creditCost: 30,
        description: 'Advanced reasoning and analysis',
        tier: 'ultra',
        enabled: false // Not yet implemented
    },
    {
        id: 'claude-3',
        name: 'Claude 3',
        provider: 'anthropic',
        creditCost: 25,
        description: 'Balanced performance and accuracy',
        tier: 'ultra',
        enabled: false // Not yet implemented
    }
];

export const getDefaultModel = (): AIModel => {
    return AI_MODELS.find(m => m.enabled) || AI_MODELS[0];
};

export const getModelById = (id: string): AIModel | undefined => {
    return AI_MODELS.find(m => m.id === id);
};
