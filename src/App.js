import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkspaceDiscover from './components/WorkspaceDiscover';
import WorkspaceOwner from './components/WorkspaceOwner';
import Project from './components/Project';
import ProjectsListSection from './components/ProjectsListSection';
import PlannerSection from './components/PlannerSection';
import RemindersCalendarSection from './components/RemindersCalendarSection';
import TrackerSection from './components/TrackerSection';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import PricingModal from './components/PricingModal';
import TaskDrawer from './components/TaskDrawer';
import RequestChangeModal from './components/RequestChangeModal';
import ToastContainer from './components/ToastContainer';

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
                  {state.currentSection === 'workspace' && <WorkspaceDiscover />}
                  {state.currentSection === 'workspaceOwner' && <WorkspaceOwner />}
                  {state.currentSection === 'workspaceMember' && <WorkspaceOwner />}
              {state.currentSection === 'project' && <Project />}
            </main>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateWorkspaceModal />
      <PricingModal />
      <RequestChangeModal />
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
