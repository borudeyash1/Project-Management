import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import ContentBanner from '../ContentBanner';

const HomeHeader: React.FC = () => {
    const { state } = useApp();
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();

    return (
        <>
            {/* Content Banner */}
            <ContentBanner route="/" />

            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-2 py-4`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {t('dashboard.welcomeBack', { name: state.userProfile?.fullName })}
                        </h1>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {t('dashboard.todayOverview')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeHeader;
