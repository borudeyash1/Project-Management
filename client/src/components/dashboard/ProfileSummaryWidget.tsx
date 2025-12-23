import React from 'react';
import { User, Briefcase, Building2, TrendingUp, Target, BookOpen, Zap, Award, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

const ProfileSummaryWidget: React.FC = () => {
    const { isDarkMode, preferences } = useTheme();
    const { state } = useApp();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const accentColor = preferences.accentColor || '#FBBF24';

    const profile = state.userProfile?.profile || {};
    const {
        jobTitle = '',
        company = '',
        industry = '',
        experience = '',
        skills = [],
        goals = {},
        personality = {},
        productivity = {}
    } = profile;

    const experienceLabels: Record<string, string> = {
        'junior': '0-2 years',
        'mid': '3-5 years',
        'senior': '6-10 years',
        'expert': '10+ years'
    };

    const industryIcons: Record<string, any> = {
        'technology': Zap,
        'finance': TrendingUp,
        'healthcare': Award,
        'education': BookOpen,
        'default': Building2
    };

    const IndustryIcon = industryIcons[industry?.toLowerCase()] || industryIcons.default;

    // Check if profile is complete
    const isProfileComplete = jobTitle && company && industry && skills.length > 0;

    return (
        <div
            className={`rounded-2xl border p-6 transition-all hover:shadow-xl ${isDarkMode
                ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-lg'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-xl"
                        style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}
                    >
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('home.professionalProfile')}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isProfileComplete ? t('home.yourProfessionalSummary') : t('home.completeYourProfile')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className={`text-sm font-medium flex items-center gap-1 transition-colors`}
                    style={{ color: accentColor }}
                >
                    {isProfileComplete ? t('common.edit') : t('home.complete')}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {isProfileComplete ? (
                <div className="space-y-4">
                    {/* Job Title & Company */}
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                <Briefcase className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {jobTitle}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {company}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Industry & Experience */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <IndustryIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('home.industry')}
                                </span>
                            </div>
                            <p className={`text-sm font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {industry}
                            </p>
                        </div>

                        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('home.experience')}
                                </span>
                            </div>
                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {experienceLabels[experience] || experience}
                            </p>
                        </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Award className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('home.topSkills')}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skills.slice(0, 5).map((skill: any, index: number) => {
                                    // Handle both string and object formats for skills
                                    const skillName = typeof skill === 'string' ? skill : skill.name || 'Unknown Skill';
                                    return (
                                        <span
                                            key={index}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode
                                                ? 'bg-gray-700 text-gray-300'
                                                : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                        >
                                            {skillName}
                                        </span>
                                    );
                                })}
                                {skills.length > 5 && (
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode
                                            ? 'bg-gray-700 text-gray-400'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        +{skills.length - 5} {t('common.more')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Goals Summary */}
                    {goals && Object.keys(goals).length > 0 && (
                        <div className={`p-3 rounded-xl border ${isDarkMode
                            ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30'
                            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Target className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                <span className={`text-xs font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                    {t('home.careerGoals')}
                                </span>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {(() => {
                                    const shortTerm = (goals as any).shortTerm;
                                    const longTerm = (goals as any).longTerm;

                                    // Helper to extract text from potential object structure
                                    const getText = (item: any) => {
                                        if (!item) return null;
                                        if (typeof item === 'string') return item;
                                        return item.description || item.title || item.name || '';
                                    };

                                    return getText(shortTerm) || getText(longTerm) || t('home.setCareerGoals');
                                })()}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                // Empty State
                <div className="text-center py-8">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                        <User className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('home.completeProfileTitle')}
                    </p>
                    <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('home.completeProfileDesc')}
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                            boxShadow: `0 4px 12px -2px ${accentColor}40`
                        }}
                    >
                        {t('home.completeProfile')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileSummaryWidget;
