import React, { useState } from 'react';
import { Mail, Calendar, FolderOpen } from 'lucide-react';
import { InboxPage } from './mail';
import { WeekGrid } from './calendar';
import { VaultPage } from './vault';

type AppView = 'mail' | 'calendar' | 'vault';

const SarttHiAppsDemo: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppView>('mail');

  const apps = [
    { id: 'mail' as AppView, label: 'Mail', icon: Mail },
    { id: 'calendar' as AppView, label: 'Calendar', icon: Calendar },
    { id: 'vault' as AppView, label: 'Vault', icon: FolderOpen },
  ];

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      {/* App Switcher */}
      <div className="bg-sidebar-bg border-b border-border-subtle">
        <div className="flex items-center gap-1 px-4 py-2">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    activeApp === app.id
                      ? 'bg-hover-bg text-white'
                      : 'text-text-muted hover:text-text-light hover:bg-hover-bg/50'
                  }
                `}
              >
                <Icon size={18} />
                {app.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1 overflow-hidden">
        {activeApp === 'mail' && <InboxPage />}
        {activeApp === 'calendar' && <WeekGrid />}
        {activeApp === 'vault' && <VaultPage />}
      </div>
    </div>
  );
};

export default SarttHiAppsDemo;
