import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider } from './context/PlannerContext';
import { TrackerProvider } from './context/TrackerContext';
import Auth from './components/Auth';
import HomePage from './components/HomePage';
import ProjectsPage from './components/ProjectsPage';
import ProjectViewDetailed from './components/ProjectViewDetailed';
import PlannerPage from './components/PlannerPage';
import PlannerLayout from './components/planner/PlannerLayout';
import Dashboard from './components/Dashboard';
import TrackerLayout from './components/tracker/TrackerLayout';
import RemindersPage from './components/RemindersPage';
import ReportsPage from './components/ReportsPage';
import TeamPage from './components/TeamPage';
import GoalsPage from './components/GoalsPage';
import SettingsSection from './components/SettingsSection';
import ProfileSection from './components/ProfileSection';
import WorkspaceDiscover from './components/WorkspaceDiscover';
import WorkspaceOwner from './components/WorkspaceOwner';
import WorkspaceMember from './components/WorkspaceMember';
import WorkspaceLayout from './components/workspace/WorkspaceLayout';
import WorkspaceOverview from './components/workspace/WorkspaceOverview';
import WorkspaceMembers from './components/workspace/WorkspaceMembers';
import WorkspaceProjects from './components/workspace/WorkspaceProjects';
import WorkspaceClients from './components/workspace/WorkspaceClients';
import WorkspaceRequests from './components/workspace/WorkspaceRequests';
import WorkspaceSettings from './components/workspace/WorkspaceSettings';
import WorkspaceInbox from './components/workspace/WorkspaceInbox';
import ProjectLayout from './components/project/ProjectLayout';
import ProjectOverview from './components/project/ProjectOverview';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ProjectManagementView from './components/ProjectManagementView';
import Header from './components/Header';
import DockNavigation from './components/DockNavigation';
import ToastContainer from './components/ToastContainer';
import NotificationsPanel from './components/NotificationsPanel';
import TaskDrawer from './components/TaskDrawer';
import TaskManagement from './components/TaskManagement';
import LandingPage from './components/LandingPage';
import About from './components/About';
import UserGuide from './components/UserGuide';
import ChatbotButton from './components/ChatbotButton';
import AdminLoginWrapper from './components/admin/AdminLoginWrapper';
import AdminDashboard from './components/admin/AdminDashboard';
import DeviceManagement from './components/admin/DeviceManagement';
import UserManagement from './components/admin/UserManagement';
import Analytics from './components/admin/Analytics';
import AdminSettings from './components/admin/Settings';
import ReleaseManagement from './components/admin/ReleaseManagement';
import './utils/setDeviceId'; // Make setMyDeviceId available globally

// Import all modals
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import WorkloadDeadlineModal from './components/WorkloadDeadlineModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import TaskRatingModal from './components/TaskRatingModal';
import PollsModal from './components/PollsModal';
import LeaderboardModal from './components/LeaderboardModal';
import PayrollModal from './components/PayrollModal';
import ExportReportsModal from './components/ExportReportsModal';
import ManageProjectModal from './components/ManageProjectModal';
import DocumentsHubModal from './components/DocumentsHubModal';
import TimesheetModal from './components/TimesheetModal';
import InviteEmployeeModal from './components/InviteEmployeeModal';
import ClientModal from './components/ClientModal';
import PricingModal from './components/PricingModal';
import RequestChangeModal from './components/RequestChangeModal';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useApp();

  // Check if user is authenticated - check for user token in localStorage
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Layout Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg dark:bg-gray-900">
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-bg dark:bg-gray-900 pb-24">
        {children}
      </main>
      <DockNavigation />
      <ToastContainer />
      <NotificationsPanel />
      <TaskDrawer />
      <ChatbotButton />
    </div>
  );
};

// App Content Component
const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  return (
    <div className="antialiased bg-bg dark:bg-gray-900 text-text dark:text-gray-100 font-inter selection-bg-primary">
      <ToastContainer />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        
        {/* Admin Routes - Hidden */}
        <Route path="/my-admin/login" element={<AdminLoginWrapper />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/devices" element={<DeviceManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/releases" element={<ReleaseManagement />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        } />



        <Route path="/projects" element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectsPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Project Internal Routes */}
        <Route path="/project/:projectId" element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectLayout />
            </AppLayout>
          </ProtectedRoute>
        }>
          <Route path="overview" element={<ProjectOverview />} />
          <Route path="info" element={<div className="p-6">Project Info - Coming Soon</div>} />
          <Route path="team" element={<div className="p-6">Team Management - Coming Soon</div>} />
          <Route path="tasks" element={<div className="p-6">Tasks & Board - Coming Soon</div>} />
          <Route path="timeline" element={<div className="p-6">Timeline - Coming Soon</div>} />
          <Route path="progress" element={<div className="p-6">Progress Tracker - Coming Soon</div>} />
          <Route path="workload" element={<div className="p-6">Workload Management - Coming Soon</div>} />
          <Route path="reports" element={<div className="p-6">Reports - Coming Soon</div>} />
          <Route path="documents" element={<div className="p-6">Documents - Coming Soon</div>} />
          <Route path="inbox" element={<div className="p-6">Project Inbox - Coming Soon</div>} />
          <Route path="settings" element={<div className="p-6">Project Settings - Coming Soon</div>} />
          <Route index element={<Navigate to="overview" replace />} />
        </Route>

        {/* Legacy Project View */}
        <Route path="/project-view/:projectId" element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectViewDetailed />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/project-management/:projectId" element={
          <ProtectedRoute>
            <AppLayout>
              <ProjectManagementView />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <AppLayout>
              <TaskManagement />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/planner" element={
          <ProtectedRoute>
            <PlannerProvider>
              <AppLayout>
                <PlannerLayout />
              </AppLayout>
            </PlannerProvider>
          </ProtectedRoute>
        } />

        <Route path="/tracker" element={
          <ProtectedRoute>
            <AppLayout>
              <TrackerLayout />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/reminders" element={
          <ProtectedRoute>
            <AppLayout>
              <RemindersPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/workspace" element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceDiscover />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/workspace/:workspaceId/owner" element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceOwner />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/workspace/:workspaceId/member" element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceMember />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Workspace Internal Routes */}
        <Route path="/workspace/:workspaceId" element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceLayout />
            </AppLayout>
          </ProtectedRoute>
        }>
          <Route path="overview" element={<WorkspaceOverview />} />
          <Route path="members" element={<WorkspaceMembers />} />
          <Route path="projects" element={<WorkspaceProjects />} />
          <Route path="clients" element={<WorkspaceClients />} />
          <Route path="requests" element={<WorkspaceRequests />} />
          <Route path="collaborate" element={<div className="p-6">Collaborate Page - Coming Soon</div>} />
          <Route path="advertise" element={<div className="p-6">Advertise Page - Coming Soon</div>} />
          <Route path="inbox" element={<WorkspaceInbox />} />
          <Route path="settings" element={<WorkspaceSettings />} />
          <Route index element={<Navigate to="overview" replace />} />
        </Route>

        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/team" element={
          <ProtectedRoute>
            <AppLayout>
              <TeamPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/goals" element={
          <ProtectedRoute>
            <AppLayout>
              <GoalsPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modals */}
      <CreateWorkspaceModal 
        isOpen={state.modals.createWorkspace} 
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: 'createWorkspace' })} 
      />
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
      <RequestChangeModal />
      <NotificationsPanel />
      <TaskDrawer />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppProvider>
          <PlannerProvider>
            <TrackerProvider>
              <AppContent />
            </TrackerProvider>
          </PlannerProvider>
        </AppProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
