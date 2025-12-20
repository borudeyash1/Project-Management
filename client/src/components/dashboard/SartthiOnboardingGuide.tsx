import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Mail, Calendar as CalendarIcon, HardDrive, MousePointer, Home as HomeIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
    const [currentStep, setCurrentStep] = useState(0);

    const serviceConfig = {
        mail: {
            icon: Mail,
            title: 'Sartthi Mail',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            steps: [
                {
                    title: 'Welcome to Sartthi Mail',
                    description: 'Your secure email platform integrated with Google Mail',
                    icon: Mail,
                    content: 'Sartthi Mail provides a seamless email experience with powerful features for managing your inbox, composing messages, and staying organized.',
                },
                {
                    title: 'Access from Dock',
                    description: 'Quick access from the sidebar',
                    icon: MousePointer,
                    content: 'Click the Mail icon in the Dock (sidebar) anytime to quickly open Sartthi Mail in a new tab.',
                },
                {
                    title: 'Access from Home',
                    description: 'Open from your dashboard',
                    icon: HomeIcon,
                    content: 'Navigate to the Home page and click "Open App" in the Sartthi Mail card to launch the application.',
                },
                {
                    title: 'Key Features',
                    description: 'What you can do',
                    icon: Check,
                    content: 'Manage your inbox, compose emails, organize with folders, search messages, and sync with your Google Mail account.',
                },
                {
                    title: "You're All Set!",
                    description: 'Start managing your emails',
                    icon: Check,
                    content: 'Your account is connected and ready to use. Click "Get Started" to open Sartthi Mail and begin managing your emails.',
                },
            ],
        },
        calendar: {
            icon: CalendarIcon,
            title: 'Sartthi Calendar',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
            steps: [
                {
                    title: 'Welcome to Sartthi Calendar',
                    description: 'Manage your schedule with ease',
                    icon: CalendarIcon,
                    content: 'Sartthi Calendar helps you organize events, set reminders, and stay on top of your schedule with Google Calendar integration.',
                },
                {
                    title: 'Access from Dock',
                    description: 'Quick access from the sidebar',
                    icon: MousePointer,
                    content: 'Click the Calendar icon in the Dock (sidebar) anytime to quickly open Sartthi Calendar in a new tab.',
                },
                {
                    title: 'Access from Home',
                    description: 'Open from your dashboard',
                    icon: HomeIcon,
                    content: 'Navigate to the Home page and click "Open App" in the Sartthi Calendar card to launch the application.',
                },
                {
                    title: 'Key Features',
                    description: 'What you can do',
                    icon: Check,
                    content: 'Create events, set reminders, share calendars, view multiple calendar views, and sync with your Google Calendar.',
                },
                {
                    title: "You're All Set!",
                    description: 'Start scheduling events',
                    icon: Check,
                    content: 'Your account is connected and ready to use. Click "Get Started" to open Sartthi Calendar and begin managing your schedule.',
                },
            ],
        },
        vault: {
            icon: HardDrive,
            title: 'Sartthi Vault',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
            steps: [
                {
                    title: 'Welcome to Sartthi Vault',
                    description: 'Secure file storage powered by Google Drive',
                    icon: HardDrive,
                    content: 'Sartthi Vault provides secure cloud storage for all your files with seamless Google Drive integration.',
                },
                {
                    title: 'Access from Dock',
                    description: 'Quick access from the sidebar',
                    icon: MousePointer,
                    content: 'Click the Vault icon in the Dock (sidebar) anytime to quickly open Sartthi Vault in a new tab.',
                },
                {
                    title: 'Access from Home',
                    description: 'Open from your dashboard',
                    icon: HomeIcon,
                    content: 'Navigate to the Home page and click "Open App" in the Sartthi Vault card to launch the application.',
                },
                {
                    title: 'Key Features',
                    description: 'What you can do',
                    icon: Check,
                    content: 'Upload files, organize folders, share documents, search your storage, and sync with your Google Drive.',
                },
                {
                    title: "You're All Set!",
                    description: 'Start storing files',
                    icon: Check,
                    content: 'Your account is connected and ready to use. Click "Get Started" to open Sartthi Vault and begin managing your files.',
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
                className={`relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl transform transition-all ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className={`${config.bgColor} p-6 text-white relative`}>
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
                                Step {currentStep + 1} of {totalSteps}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700">
                    <div
                        className={`h-full transition-all duration-300 ${config.bgColor}`}
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
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
                                        ? `w-8 ${config.bgColor}`
                                        : index < currentStep
                                            ? `w-2 ${config.bgColor} opacity-50`
                                            : `w-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`
                                    }`}
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
                        Skip Guide
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
                                Previous
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${config.bgColor} hover:shadow-lg`}
                        >
                            {currentStep === totalSteps - 1 ? (
                                <>
                                    Get Started
                                    <Check className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Next
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
