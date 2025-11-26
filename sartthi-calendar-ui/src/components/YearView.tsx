import React from 'react';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

interface YearViewProps {
  currentDate: Date;
  onMonthClick: (date: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({ currentDate, onMonthClick }) => {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-app-bg">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
          const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
          const days = eachDayOfInterval({ start: startDate, end: endDate });

          return (
            <div 
              key={month.toISOString()} 
              className="bg-card-bg rounded-lg p-4 border border-border-subtle hover:border-accent-blue transition-colors cursor-pointer"
              onClick={() => onMonthClick(month)}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-3 text-center">
                {format(month, 'MMMM')}
              </h3>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-xs text-text-muted font-medium">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day) => {
                  const isCurrentMonth = isSameMonth(day, month);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`
                        text-xs w-6 h-6 flex items-center justify-center rounded-full mx-auto
                        ${!isCurrentMonth ? 'invisible' : 'text-text-primary'}
                        ${isTodayDate ? 'bg-accent-blue text-white' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearView;
