import React from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkspaceProfile: React.FC = () => {
  const { state, addToast } = useApp();
  const navigate = useNavigate();
  const currentWorkspace = state.workspaces.find((ws) => ws._id === state.currentWorkspace);
  const isOwner = currentWorkspace?.owner === state.userProfile._id;

  const memberRecord = currentWorkspace?.members?.find((member) => member.user === state.userProfile._id);
  const derivedRole = memberRecord?.role || (isOwner ? 'owner' : 'member');

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
          <p className="text-gray-600 dark:text-gray-700">Select a workspace to view profile details.</p>
        </div>
      </div>
    );
  }

  const handleInviteClick = () => {
    sessionStorage.setItem('workspaceMembersOpenInvite', 'true');
    window.dispatchEvent(new Event('workspace:open-invite'));
    navigate(`/workspace/${currentWorkspace._id}/members`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm uppercase text-gray-600 dark:text-gray-300 tracking-wide">Workspace</p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{currentWorkspace.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-200">{currentWorkspace.description || 'No description provided.'}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-200">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{state.userProfile.fullName || 'Unnamed User'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-200">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{state.userProfile.email || 'Not available'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-200">Mobile</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {state.userProfile.phone || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-200">Current role</p>
                <p className="font-medium capitalize text-gray-900 dark:text-gray-100">{derivedRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Workspace insights</h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-200">Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentWorkspace.memberCount || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-200">Workspace type</p>
            <p className="text-2xl font-bold capitalize text-gray-900 dark:text-gray-100">{currentWorkspace.type}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-200">Subscription</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentWorkspace.subscription.plan}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Face scan setup</h4>
          <p className="text-sm text-gray-600 dark:text-gray-200">
            Load your face details once so attendance can verify you automatically. This is available for every
            member in this workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/workspace/${currentWorkspace._id}/member?autoFaceScan=1`)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-accent text-gray-900 text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Open face scan
        </button>
      </div>
    </div>
  );
};

export default WorkspaceProfile;

