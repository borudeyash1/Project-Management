import React from 'react';
import { useApp } from '../context/AppContext';

const ProjectView: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Project View</h1>
        <p className="text-slate-600">Current Project: {state.currentProject}</p>
        <p className="text-slate-600">Current Workspace: {state.currentWorkspace}</p>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Project view component will be implemented here with full functionality.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
