import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { dispatch } = useApp();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
  ];

  const handleLanguageChange = async (langCode: string, langName: string) => {
    try {
      await i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `Language changed to ${langName}`,
          duration: 2000
        }
      });
    } catch (error) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to change language',
          duration: 3000
        }
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Language</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`px-4 py-3 rounded-lg border transition-all text-left ${
              i18n.language === lang.code
                ? 'bg-accent text-gray-900 border-accent-dark ring-2 ring-accent ring-offset-2'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
            }`}
            onClick={() => handleLanguageChange(lang.code, lang.name)}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
