import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Moon, SunMedium, Shield, Calendar as CalendarIcon, Palette } from 'lucide-react';

const SettingsSection = () => {
  const { state, dispatch } = useApp();

  const update = (payload) => dispatch({ type: 'UPDATE_SETTINGS', payload });
  const updateNested = (path, value) => dispatch({ type: 'UPDATE_SETTINGS_NESTED', payload: { path, value } });

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <h3 className="text-[18px] tracking-tight font-semibold">Appearance</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium">Theme Color</div>
            <div className="mt-2 flex items-center gap-2">
              {['yellow','blue','emerald','purple','rose'].map(color => (
                <button
                  key={color}
                  className={`h-8 w-8 rounded-full border ${state.settings.themeColor === color ? 'ring-2 ring-yellow-500' : ''}`}
                  style={{ backgroundColor: color === 'yellow' ? '#eab308' : undefined }}
                  onClick={() => update({ themeColor: color })}
                  aria-label={`Set theme ${color}`}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Mode</div>
            <div className="mt-2 flex items-center gap-3">
              <button
                className={`px-3 py-1.5 rounded-md border text-sm ${!state.settings.darkMode ? 'bg-yellow-100' : 'hover:bg-slate-50'}`}
                onClick={() => update({ darkMode: false })}
              >
                <SunMedium className="w-4 h-4 inline-block mr-1" /> Light
              </button>
              <button
                className={`px-3 py-1.5 rounded-md border text-sm ${state.settings.darkMode ? 'bg-yellow-100' : 'hover:bg-slate-50'}`}
                onClick={() => update({ darkMode: true })}
              >
                <Moon className="w-4 h-4 inline-block mr-1" /> Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="text-[18px] tracking-tight font-semibold">Notifications</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'In-App', path: ['notifications','inApp'] },
            { label: 'Email', path: ['notifications','email'] },
            { label: 'Push', path: ['notifications','push'] },
          ].map(opt => (
            <label key={opt.label} className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
              <span className="text-sm">{opt.label}</span>
              <input
                type="checkbox"
                checked={opt.path.reduce((acc, k) => acc[k], state.settings)}
                onChange={(e) => updateNested(opt.path, e.target.checked)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          <h3 className="text-[18px] tracking-tight font-semibold">Calendar</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
            <span className="text-sm">Sync Google Calendar</span>
            <input
              type="checkbox"
              checked={state.settings.calendar.syncGoogle}
              onChange={(e) => updateNested(['calendar','syncGoogle'], e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
            <span className="text-sm">Sync Outlook</span>
            <input
              type="checkbox"
              checked={state.settings.calendar.syncOutlook}
              onChange={(e) => updateNested(['calendar','syncOutlook'], e.target.checked)}
            />
          </label>
          <div>
            <div className="text-sm">Default View</div>
            <select
              className="mt-2 w-full border border-border rounded-md p-2 text-sm"
              value={state.settings.calendar.defaultView}
              onChange={(e) => updateNested(['calendar','defaultView'], e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="text-[18px] tracking-tight font-semibold">Privacy & Security</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm">Profile Visibility</div>
            <select
              className="mt-2 w-full border border-border rounded-md p-2 text-sm"
              value={state.settings.privacy.profileVisibility}
              onChange={(e) => updateNested(['privacy','profileVisibility'], e.target.value)}
            >
              <option value="public">Public</option>
              <option value="workspace">Workspace</option>
              <option value="private">Private</option>
            </select>
          </div>
          <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
            <span className="text-sm">Two-factor Authentication</span>
            <input
              type="checkbox"
              checked={state.settings.privacy.twoFactorAuth}
              onChange={(e) => updateNested(['privacy','twoFactorAuth'], e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;


