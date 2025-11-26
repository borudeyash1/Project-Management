import React from 'react';
import { Calendar, Layout, Grid, Clock, Briefcase, EyeOff, Check } from 'lucide-react';

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

interface ViewSwitcherProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  workHoursOnly: boolean;
  setWorkHoursOnly: (value: boolean) => void;
  dimPastEvents: boolean;
  setDimPastEvents: (value: boolean) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ 
  currentView, 
  onViewChange,
  workHoursOnly,
  setWorkHoursOnly,
  dimPastEvents,
  setDimPastEvents
}) => {
  const views: { id: CalendarViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Day', icon: <Clock size={16} /> },
    { id: 'week', label: 'Week', icon: <Layout size={16} /> },
    { id: 'month', label: 'Month', icon: <Calendar size={16} /> },
    { id: 'year', label: 'Year', icon: <Grid size={16} /> },
  ];

  return (
    <div className="flex items-center gap-4">
      {/* View Modes */}
      <div className="flex items-center bg-card-bg rounded-lg border border-border-subtle p-1">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${currentView === view.id 
                ? 'bg-accent-blue text-white shadow-sm' 
                : 'text-text-muted hover:text-text-primary hover:bg-hover-bg'
              }
            `}
          >
            {view.icon}
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border-subtle" />

      {/* View Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setWorkHoursOnly(!workHoursOnly)}
          title="Toggle Work Hours Only"
          className={`
            p-2 rounded-lg border transition-colors
            ${workHoursOnly 
              ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
              : 'bg-card-bg border-border-subtle text-text-muted hover:text-text-primary hover:bg-hover-bg'
            }
          `}
        >
          <Briefcase size={18} />
        </button>
        
        <button
          onClick={() => setDimPastEvents(!dimPastEvents)}
          title="Dim Past Events"
          className={`
            p-2 rounded-lg border transition-colors
            ${dimPastEvents 
              ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
              : 'bg-card-bg border-border-subtle text-text-muted hover:text-text-primary hover:bg-hover-bg'
            }
          `}
        >
          <EyeOff size={18} />
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;
