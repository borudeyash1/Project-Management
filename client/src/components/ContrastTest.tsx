import React from 'react';
import { PlanStatus } from './FeatureRestriction';

const ContrastTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-contrast-high">Contrast Test Page</h1>

      {/* Plan Status Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Plan Status Component</h2>
        <PlanStatus />
      </div>

      {/* Button Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Button Contrast Tests</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="btn-primary px-4 py-2 rounded-lg">Primary Button</button>
          <button className="btn-secondary px-4 py-2 rounded-lg">Secondary Button</button>
          <button className="btn-outline px-4 py-2 rounded-lg border">Outline Button</button>
        </div>
      </div>

      {/* Priority Labels Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Priority Labels</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="priority-urgent px-3 py-1 rounded-full text-sm font-medium">Urgent</span>
          <span className="priority-high px-3 py-1 rounded-full text-sm font-medium">High</span>
          <span className="priority-medium px-3 py-1 rounded-full text-sm font-medium">Medium</span>
          <span className="priority-low px-3 py-1 rounded-full text-sm font-medium">Low</span>
        </div>
      </div>

      {/* Status Labels Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Status Labels</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="status-active px-3 py-1 rounded-full text-sm font-medium">Active</span>
          <span className="status-on-hold px-3 py-1 rounded-full text-sm font-medium">On Hold</span>
          <span className="status-completed px-3 py-1 rounded-full text-sm font-medium">Completed</span>
        </div>
      </div>

      {/* Plan Type Labels Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Plan Type Labels</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="plan-free px-3 py-1 rounded-full text-sm font-medium">Free Plan</span>
          <span className="plan-pro px-3 py-1 rounded-full text-sm font-medium">Pro Plan</span>
          <span className="plan-ultra px-3 py-1 rounded-full text-sm font-medium">Ultra Plan</span>
        </div>
      </div>

      {/* Link Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Link Colors</h2>
        <div className="space-y-2">
          <div>
            <a href="#" className="link-primary">Primary Link</a> - Better contrast blue link
          </div>
          <div>
            <a href="#" className="link-secondary">Secondary Link</a> - Better contrast gray link
          </div>
        </div>
      </div>

      {/* Text Contrast Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Text Contrast Levels</h2>
        <div className="space-y-2">
          <p className="text-contrast-high">High contrast text - for main content</p>
          <p className="text-contrast-medium">Medium contrast text - for secondary content</p>
          <p className="text-contrast-low">Low contrast text - for subtle information</p>
        </div>
      </div>

      {/* Card Example */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-contrast-high">Card Example</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-contrast-high">Sample Project</h3>
            <span className="status-active px-2 py-1 rounded-full text-xs font-medium">Active</span>
          </div>
          <p className="text-contrast-medium mb-4">This is a sample project description with improved text contrast.</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-contrast-medium text-sm">Progress: <span className="text-contrast-high font-medium">75%</span></p>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
            <button className="btn-primary px-3 py-1 text-sm rounded">View Details</button>
          </div>
        </div>
      </div>

      {/* Dark Mode Toggle Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          💡 <strong>Tip:</strong> Toggle dark mode using your system settings or the app's theme switcher to see how all these elements maintain proper contrast in both light and dark themes.
        </p>
      </div>
    </div>
  );
};

export default ContrastTest;
