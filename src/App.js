import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkspaceDiscover from './components/WorkspaceDiscover';
import WorkspaceOwner from './components/WorkspaceOwner';
import WorkspaceMember from './components/WorkspaceMember';
import ProjectView from './components/ProjectView';
import ProjectsListSection from './components/ProjectsListSection';
import PlannerSection from './components/PlannerSection';
import RemindersCalendarSection from './components/RemindersCalendarSection';
import TrackerSection from './components/TrackerSection';
import SettingsSection from './components/SettingsSection';
import ProfileSection from './components/ProfileSection';
import LeaderboardModal from './components/LeaderboardModal';
import PayrollModal from './components/PayrollModal';
import ExportReportsModal from './components/ExportReportsModal';
import ManageProjectModal from './components/ManageProjectModal';
import DocumentsHubModal from './components/DocumentsHubModal';
import TimesheetModal from './components/TimesheetModal';
import InviteEmployeeModal from './components/InviteEmployeeModal';
import ClientModal from './components/ClientModal';
import CreateProjectModal from './components/CreateProjectModal';
import WorkloadDeadlineModal from './components/WorkloadDeadlineModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import TaskRatingModal from './components/TaskRatingModal';
import PollsModal from './components/PollsModal';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import PricingModal from './components/PricingModal';
import TaskDrawer from './components/TaskDrawer';
import RequestChangeModal from './components/RequestChangeModal';
import ToastContainer from './components/ToastContainer';
import NotificationsPanel from './components/NotificationsPanel';

function AppContent() {
  const { state } = useApp();

  return (
    <div className="antialiased bg-bg text-text font-inter selection-bg-primary">
      <ToastContainer />
      
      {/* Auth Section */}
      {state.currentSection === 'login' && <Auth />}
      
      {/* App Frame */}
      {state.currentSection !== 'login' && (
        <div className="min-h-screen">
          <Header />
          <div className="flex min-h-[calc(100vh-56px)]">
            <Sidebar />
            <main className="flex-1">
              {state.currentSection === 'dashboard' && <Dashboard />}
              {state.currentSection === 'projects' && <ProjectsListSection />}
              {state.currentSection === 'planner' && <PlannerSection />}
              {state.currentSection === 'tracker' && <TrackerSection />}
              {state.currentSection === 'reminders' && <RemindersCalendarSection />}
              {state.currentSection === 'settings' && <SettingsSection />}
              {state.currentSection === 'profile' && <ProfileSection />}
                  {state.currentSection === 'workspace' && <WorkspaceDiscover />}
                  {state.currentSection === 'workspaceOwner' && <WorkspaceOwner />}
                  {state.currentSection === 'workspaceMember' && <WorkspaceMember />}
              {state.currentSection === 'project' && <ProjectView />}
            </main>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <WorkloadDeadlineModal />
      <TaskDetailsModal />
      <TaskRatingModal />
      <PollsModal />
      <LeaderboardModal />
      <PayrollModal />
      <ExportReportsModal />
      <ManageProjectModal />
      <DocumentsHubModal />
      <TimesheetModal />
      <InviteEmployeeModal />
      <ClientModal />
      <PricingModal />
      <RequestChangeModal />
      <NotificationsPanel />
      <TaskDrawer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
