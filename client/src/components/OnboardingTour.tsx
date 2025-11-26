import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TourStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action text like "Click here"
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tourKey: string; // Unique key for this tour (e.g., 'mail-tour', 'calendar-tour')
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  tourKey
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const element = document.querySelector(steps[currentStep].target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const position = steps[currentStep].position || 'bottom';
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - 20;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 20;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }
      
      setTooltipPosition({ top, left });
    }
  }, [currentStep, isOpen, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  const handleComplete = () => {
    // Mark tour as completed in localStorage
    localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    onClose();
  };

  if (!isOpen || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />
        
        {/* Spotlight on target element */}
        {targetElement && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-2xl shadow-blue-500/50 animate-pulse-slow pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              transition: 'all 0.3s ease-in-out'
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] pointer-events-auto animate-slideUp"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translate(-50%, 0)',
          maxWidth: '400px'
        }}
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
              </div>
              <button
                onClick={handleSkip}
                className="ml-4 p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Action hint */}
            {step.action && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                  {step.action}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-blue-500 w-6'
                        : index < currentStep
                        ? 'bg-blue-500/50'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-4 h-4 bg-gray-900 transform rotate-45 ${
            step.position === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2' :
            step.position === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2' :
            step.position === 'right' ? 'left-[-8px] top-1/2 -translate-y-1/2' :
            'top-[-8px] left-1/2 -translate-x-1/2'
          }`}
        />
      </div>
    </>
  );
};

export default OnboardingTour;
