import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import GlassmorphicCard from '../ui/GlassmorphicCard';

interface ActionItem {
    task: string;
    assignee: string;
    priority: 'High' | 'Medium' | 'Low';
}

interface MeetingAnalysis {
    summary: string;
    agendaItems: string[];
    decisions: string[];
    actionItems: ActionItem[];
}

interface AIResultDisplayProps {
    result: MeetingAnalysis | null;
    isProcessing: boolean;
}

const AIResultDisplay: React.FC<AIResultDisplayProps> = ({ result, isProcessing }) => {
    const { isDarkMode, preferences } = useTheme();

    if (isProcessing) {
        return (
            <GlassmorphicCard className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"
                        style={{ borderColor: preferences.accentColor }}
                    ></div>
                    <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Processing transcript with AI...
                    </p>
                </div>
            </GlassmorphicCard>
        );
    }

    if (!result) {
        return (
            <GlassmorphicCard className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        AI summary will appear here after processing
                    </p>
                </div>
            </GlassmorphicCard>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return isDarkMode ? 'text-red-400' : 'text-red-600';
            case 'Medium':
                return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
            case 'Low':
                return isDarkMode ? 'text-green-400' : 'text-green-600';
            default:
                return isDarkMode ? 'text-gray-400' : 'text-gray-600';
        }
    };

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-0.5 rounded-full text-xs font-semibold";
        switch (priority) {
            case 'High':
                return `${baseClasses} ${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'}`;
            case 'Medium':
                return `${baseClasses} ${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`;
            case 'Low':
                return `${baseClasses} ${isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`;
            default:
                return `${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`;
        }
    };

    return (
        <div className="space-y-4">
            {/* Summary Section */}
            <GlassmorphicCard className="p-6">
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📝 Executive Summary
                </h3>
                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {result.summary}
                </p>
            </GlassmorphicCard>

            {/* Agenda Items */}
            {result.agendaItems.length > 0 && (
                <GlassmorphicCard className="p-6">
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📋 Topics Discussed
                    </h3>
                    <ul className="space-y-2">
                        {result.agendaItems.map((item, index) => (
                            <li key={index} className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </GlassmorphicCard>
            )}

            {/* Decisions */}
            {result.decisions.length > 0 && (
                <GlassmorphicCard className="p-6">
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ✅ Key Decisions
                    </h3>
                    <ul className="space-y-3">
                        {result.decisions.map((decision, index) => (
                            <li key={index} className="flex items-start">
                                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 text-green-500 mt-0.5" />
                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {decision}
                                </span>
                            </li>
                        ))}
                    </ul>
                </GlassmorphicCard>
            )}

            {/* Action Items */}
            {result.actionItems.length > 0 && (
                <GlassmorphicCard className="p-6">
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🎯 Action Items
                    </h3>
                    <div className="space-y-3">
                        {result.actionItems.map((item, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border transition-all ${isDarkMode
                                        ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                                        : 'bg-white/50 border-gray-200/50 hover:bg-white/80'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start flex-1">
                                        <input
                                            type="checkbox"
                                            className="mt-1 mr-3 h-4 w-4 rounded cursor-pointer"
                                            style={{ accentColor: preferences.accentColor }}
                                        />
                                        <div className="flex-1">
                                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {item.task}
                                            </p>
                                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Assigned to: <span className="font-medium">{item.assignee}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className={getPriorityBadge(item.priority)}>
                                        {item.priority}
                                    </span>
                                </div>
                                <button
                                    className={`mt-2 text-sm font-medium transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                    onClick={() => {
                                        // Mock action for now
                                        console.log('Add to projects:', item.task);
                                    }}
                                >
                                    + Add to Projects
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassmorphicCard>
            )}
        </div>
    );
};

export default AIResultDisplay;
