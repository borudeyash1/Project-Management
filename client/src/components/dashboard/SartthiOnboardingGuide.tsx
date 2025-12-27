import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Mail, Calendar as CalendarIcon, HardDrive, MousePointer, Home as HomeIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface SartthiOnboardingGuideProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    service: 'mail' | 'calendar' | 'vault';
}

const SartthiOnboardingGuide: React.FC<SartthiOnboardingGuideProps> = ({
    isOpen,
    onClose,
    onComplete,
    service,
}) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const serviceConfig = {
        mail: {
            icon: Mail,
            title: t('onboarding.mail.title'),
            gradient: 'from-blue-500 to-cyan-500',
            gradientStyle: { background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
            steps: [
                {
                    title: t('onboarding.mail.welcome'),
                    description: t('onboarding.mail.welcomeDesc'),
                    icon: Mail,
                    content: t('onboarding.mail.welcomeContent'),
                },
                {
                    title: t('onboarding.mail.accessDock'),
                    description: t('onboarding.mail.accessDockDesc'),
                    icon: MousePointer,
                    content: t('onboarding.mail.accessDockContent'),
                },
                {
                    title: t('onboarding.mail.accessHome'),
                    description: t('onboarding.mail.accessHomeDesc'),
                    icon: HomeIcon,
                    content: t('onboarding.mail.accessHomeContent'),
                },
                {
                    title: t('onboarding.mail.keyFeatures'),
                    description: t('onboarding.mail.keyFeaturesDesc'),
                    icon: Check,
                    content: t('onboarding.mail.keyFeaturesContent'),
                },
                {
                    title: t('onboarding.mail.allSet'),
                    description: t('onboarding.mail.allSetDesc'),
                    icon: Check,
                    content: t('onboarding.mail.allSetContent'),
                },
            ],
        },
        calendar: {
            icon: CalendarIcon,
            title: t('onboarding.calendar.title'),
            gradient: 'from-purple to-pink-500',
            gradientStyle: { background: 'linear-gradient(135deg, #7C58FF 0%, #ec4899 100%)' },
            steps: [
                {
                    title: t('onboarding.calendar.welcome'),
                    description: t('onboarding.calendar.welcomeDesc'),
                    icon: CalendarIcon,
                    content: t('onboarding.calendar.welcomeContent'),
                },
                {
                    title: t('onboarding.calendar.accessDock'),
                    description: t('onboarding.calendar.accessDockDesc'),
                    icon: MousePointer,
                    content: t('onboarding.calendar.accessDockContent'),
                },
                {
                    title: t('onboarding.calendar.accessHome'),
                    description: t('onboarding.calendar.accessHomeDesc'),
                    icon: HomeIcon,
                    content: t('onboarding.calendar.accessHomeContent'),
                },
                {
                    title: t('onboarding.calendar.keyFeatures'),
                    description: t('onboarding.calendar.keyFeaturesDesc'),
                    icon: Check,
                    content: t('onboarding.calendar.keyFeaturesContent'),
                },
                {
                    title: t('onboarding.calendar.allSet'),
                    description: t('onboarding.calendar.allSetDesc'),
                    icon: Check,
                    content: t('onboarding.calendar.allSetContent'),
                },
            ],
        },
        vault: {
            icon: HardDrive,
            title: t('onboarding.vault.title'),
            gradient: 'from-green-500 to-emerald-500',
            gradientStyle: { background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' },
            steps: [
                {
                    title: t('onboarding.vault.welcome'),
                    description: t('onboarding.vault.welcomeDesc'),
                    icon: HardDrive,
                    content: t('onboarding.vault.welcomeContent'),
                },
                {
                    title: t('onboarding.vault.accessDock'),
                    description: t('onboarding.vault.accessDockDesc'),
                    icon: MousePointer,
                    content: t('onboarding.vault.accessDockContent'),
                },
                {
                    title: t('onboarding.vault.accessHome'),
                    description: t('onboarding.vault.accessHomeDesc'),
                    icon: HomeIcon,
                    content: t('onboarding.vault.accessHomeContent'),
                },
                {
                    title: t('onboarding.vault.keyFeatures'),
                    description: t('onboarding.vault.keyFeaturesDesc'),
                    icon: Check,
                    content: t('onboarding.vault.keyFeaturesContent'),
                },
                {
                    title: t('onboarding.vault.allSet'),
                    description: t('onboarding.vault.allSetDesc'),
                    icon: Check,
                    content: t('onboarding.vault.allSetContent'),
                },
            ],
        },
    };

    const config = serviceConfig[service];
    const totalSteps = config.steps.length;
    const currentStepData = config.steps[currentStep];
    const StepIcon = currentStepData.icon;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        // Store completion status in localStorage
        localStorage.setItem(`sartthi-${service}-guide-completed`, 'true');
        onComplete();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className={`relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden transform transition-all ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
            >
                {/* Header */}
                <div
                    className={`bg-gradient-to-br ${config.gradient} p-6 text-white relative`}
                    style={config.gradientStyle}
                >
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <config.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{config.title}</h2>
                            <p className="text-white/80 text-sm">
                                {t('onboarding.stepOf', { current: currentStep + 1, total: totalSteps })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700">
                    <div
                        className={`h-full transition-all duration-300 bg-gradient-to-br ${config.gradient}`}
                        style={{
                            ...config.gradientStyle,
                            width: `${((currentStep + 1) / totalSteps) * 100}%`
                        }}
                    />
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <StepIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {currentStepData.title}
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {currentStepData.description}
                            </p>
                        </div>
                    </div>

                    <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {currentStepData.content}
                    </p>

                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {config.steps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`h-2 rounded-full transition-all ${index === currentStep
                                    ? `w-8 bg-gradient-to-br ${config.gradient}`
                                    : index < currentStep
                                        ? `w-2 bg-gradient-to-br ${config.gradient} opacity-50`
                                        : `w-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`
                                    }`}
                                style={index === currentStep ? config.gradientStyle : index < currentStep ? { ...config.gradientStyle, opacity: 0.5 } : {}}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`px-8 py-4 flex items-center justify-between border-t ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                >
                    <button
                        onClick={handleSkip}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                    >
                        {t('onboarding.skipGuide')}
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrevious}
                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isDarkMode
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t('onboarding.previous')}
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 bg-gradient-to-br ${config.gradient}`}
                            style={config.gradientStyle}
                        >
                            {currentStep === totalSteps - 1 ? (
                                <>
                                    {t('onboarding.getStarted')}
                                    <Check className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    {t('onboarding.next')}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SartthiOnboardingGuide;
