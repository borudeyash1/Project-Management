import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
  translationKey: string;
  values?: Record<string, any>;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  showEnglishOnHover?: boolean;
}

/**
 * TranslatedText component that shows English translation on hover
 * when the current language is not English
 */
const TranslatedText: React.FC<TranslatedTextProps> = ({
  translationKey,
  values,
  className = '',
  as: Component = 'span',
  showEnglishOnHover = true
}) => {
  const { t, i18n } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  const isEnglish = i18n.language === 'en';
  const translatedText = t(translationKey, values);
  
  // Get English translation for tooltip
  const englishText = i18n.getFixedT('en')(translationKey, values);

  const handleMouseEnter = () => {
    if (!isEnglish && showEnglishOnHover && englishText !== translatedText) {
      // Show tooltip after 800ms hover
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 800);
      setHoverTimer(timer);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setShowTooltip(false);
  };

  return (
    <div className="relative inline-block">
      <Component
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {translatedText}
      </Component>
      
      {showTooltip && !isEnglish && (
        <div className="absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap -top-10 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-75">EN:</span>
            <span>{englishText}</span>
          </div>
          {/* Arrow */}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default TranslatedText;
