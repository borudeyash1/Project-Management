import React from 'react';
import { useTranslation } from 'react-i18next';

const RemindersCalendarSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">{t('reminders.title')}</h1>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">{t('reminders.placeholder')}</p>
        </div>
      </div>
    </div>
  );
};

export default RemindersCalendarSection;
