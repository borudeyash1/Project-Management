import React from 'react';
import { Check } from 'lucide-react';

const RemindersCalendarSection = () => {
  const toggleCheck = (e) => {
    const icon = e.target.querySelector('i') || e.target;
    if (!icon) return;
    const isOn = icon.classList.contains('opacity-100');
    icon.classList.toggle('opacity-100', !isOn);
    icon.classList.toggle('opacity-0', isOn);
    e.target.classList.toggle('bg-emerald-50', !isOn);
    e.target.classList.toggle('border-emerald-200', !isOn);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div id="reminders" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div id="calendar" className="lg:col-span-8 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] tracking-tight font-semibold">Calendar</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">Week</button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-sm">Month</button>
              <button className="px-3 py-2 rounded-lg text-white text-sm bg-primary">Add event</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center">
            <div className="text-xs text-slate-500">Mon</div>
            <div className="text-xs text-slate-500">Tue</div>
            <div className="text-xs text-slate-500">Wed</div>
            <div className="text-xs text-slate-500">Thu</div>
            <div className="text-xs text-slate-500">Fri</div>
            <div className="text-xs text-slate-500">Sat</div>
            <div className="text-xs text-slate-500">Sun</div>
            <div className="col-span-7 h-40 rounded-lg border border-border bg-slate-50 flex items-center justify-center text-slate-500">Calendar placeholder</div>
          </div>
        </div>
        <div className="lg:col-span-4 bg-white border border-border rounded-xl p-5">
          <h3 className="text-[18px] tracking-tight font-semibold">Reminders</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  className="task-check h-5 w-5 rounded-md border border-border flex items-center justify-center hover:bg-slate-50"
                  onClick={toggleCheck}
                >
                  <Check className="w-4 h-4 opacity-0" />
                </button>
                <div>
                  <div className="text-sm font-medium">Submit timesheet</div>
                  <div className="text-xs text-slate-500">Today • 6:00 PM</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersCalendarSection;


