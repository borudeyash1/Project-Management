import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider } from './context/PlannerContext';
import { TrackerProvider } from './context/TrackerContext';
import { DockProvider, useDock } from './context/DockContext';
import { HelmetProvider } from 'react-helmet-async';
import './i18n'; // Initialize i18n
import Auth from './components/Auth';
import DesktopHandshake from './components/DesktopHandshake';
import DesktopShell from './components/DesktopShell';
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
import ManageWorkspace from './components/ManageWorkspace';
import WorkspaceDetailView from './components/WorkspaceDetailView';
import WorkspaceLayout from './components/workspace/WorkspaceLayout';
import WorkspaceOverview from './components/workspace/WorkspaceOverview';
import WorkspaceMembers from './components/workspace/WorkspaceMembers';
import WorkspaceMembersInternal from './components/workspace/WorkspaceMembersInternal';
import WorkspaceProjects from './components/workspace/WorkspaceProjects';
import WorkspaceClients from './components/workspace/WorkspaceClients';
import WorkspaceRequests from './components/workspace/WorkspaceRequests';
import WorkspaceCollaborate from './components/workspace/WorkspaceCollaborate';
import WorkspaceSettings from './components/workspace/WorkspaceSettings';
import WorkspaceInbox from './components/workspace/WorkspaceInbox';
import WorkspaceProfile from './components/workspace/WorkspaceProfile';
import WorkspaceAttendanceTab from './components/workspace-detail/WorkspaceAttendanceTab';
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
import AIInformationPage from './components/AIInformationPage';
import About from './components/About';
import SartthiApps from './components/SartthiApps';
import Docs from './components/Docs';
import PricingPage from './components/PricingPage';
import ActivityPage from './components/ActivityPage';
import ChatbotButton from './components/ChatbotButton';
import AdminLoginWrapper from './components/admin/AdminLoginWrapper';
import AdminDashboard from './components/admin/AdminDashboard';
import DeviceManagement from './components/admin/DeviceManagement';
import UserManagement from './components/admin/UserManagement';
import Analytics from './components/admin/Analytics';
import AdminSettings from './components/admin/Settings';
import ReleaseManagement from './components/admin/ReleaseManagement';
import AdminSubscriptions from './components/admin/AdminSubscriptions';
import AdminDocs from './components/admin/AdminDocs';
import AdminContent from './components/admin/AdminContent';
import CanvasEditorPage from './components/admin/CanvasEditorPage';
import FolderDemo from './components/FolderDemo';
import CalendarPage from './components/calendar/CalendarPage';
import InboxPage from './components/mail/InboxPage';
import NotesPage from './components/NotesPage';
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
import LoadingAnimation from './components/LoadingAnimation';

import HomeHeader from './components/dashboard/HomeHeader';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useApp();

  if (state.isAuthLoading) {
    return <LoadingAnimation fullScreen message="Authenticating..." />;
  }

  // Check if user is authenticated
  const isAuthenticated = !!state.userProfile._id;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Workspace Attendance Wrapper to get workspaceId from route
const WorkspaceAttendanceWrapper: React.FC = () => {
  const { workspaceId } = require('react-router-dom').useParams();
  return <WorkspaceAttendanceTab workspaceId={workspaceId || ''} />;
};

// Main App Layout Component with Flexible Dock Positioning
const AppLayout: React.FC<{ children: ReactNode; topBar?: ReactNode }> = ({ children, topBar }) => {
  const { dockPosition } = useDock();

  const isHorizontalDock = dockPosition === 'left' || dockPosition === 'right';
  const isTopDock = dockPosition === 'top';
  const isBottomDock = dockPosition === 'bottom';

  // For top/bottom: Dock is fixed at viewport edges
  if (!isHorizontalDock) {
    return (
      <div className="min-h-screen bg-bg flex flex-col px-2">
        {/* Dock Fixed at Top */}
        {isTopDock && <DockNavigation />}

        {/* Header - Sticky */}
        {/* If TopDock, push Header down so it starts below Fixed Dock */}
        <div className={isTopDock ? 'mt-[52px]' : ''}>
          <Header />
        </div>

        {/* TopBar */}
        {topBar}

        {/* Main Content Area */}
        {/* Content follows naturally. Bottom padding for bottom dock. */}
        <div className={`flex-1 relative ${isBottomDock ? 'mb-[52px]' : ''}`}>
          {children}
        </div>

        {/* Dock Fixed at Bottom */}
        {isBottomDock && <DockNavigation />}

        {/* Fixed Components */}
        <ToastContainer />
        <NotificationsPanel />
        <TaskDrawer />
        <ChatbotButton />
      </div>
    );
  }

  // For left/right: Header and TopBar are FULL WIDTH, Dock sits BELOW them
  return (
    <div className="min-h-screen bg-bg flex flex-col px-2">
      {/* Header - Full Width */}
      <Header />

      {/* Top Bar (e.g. Welcome Banner) - Full Width */}
      {topBar}

      {/* Main Layout Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Dock Navigation (Fixed Position maintained by component) */}
        <DockNavigation />

        {/* Content Area with Padding for Dock */}
        <div className="h-full w-full overflow-y-auto bg-bg">
          {children}
        </div>
      </div>

      {/* Fixed Components */}
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
        <Route path="/ai" element={<AIInformationPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/apps" element={<SartthiApps />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/desktop-handshake" element={<DesktopHandshake />} />
        <Route path="/desktop-handshake" element={<DesktopHandshake />} />
        <Route path="/desktop-shell" element={<DesktopShell />} />
        <Route path="/folder-demo" element={<FolderDemo />} />

        {/* Admin Routes - Hidden */}
        <Route path="/my-admin/login" element={<AdminLoginWrapper />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/devices" element={<DeviceManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/releases" element={<ReleaseManagement />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/docs" element={<AdminDocs />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/canvas-editor" element={<CanvasEditorPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <AppLayout topBar={<HomeHeader />}>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />

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
          <Route path="info" element={<ProjectViewDetailed />} />
          <Route path="team" element={<ProjectViewDetailed />} />
          <Route path="tasks" element={<ProjectViewDetailed />} />
          <Route path="timeline" element={<ProjectViewDetailed />} />
          <Route path="progress" element={<ProjectViewDetailed />} />
          <Route path="workload" element={<ProjectViewDetailed />} />
          <Route path="attendance" element={<ProjectViewDetailed />} />
          <Route path="reports" element={<ProjectViewDetailed />} />
          <Route path="documents" element={<ProjectViewDetailed />} />
          <Route path="inbox" element={<ProjectViewDetailed />} />
          <Route path="settings" element={<ProjectViewDetailed />} />
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

        <Route path="/manage-workspace" element={
          <ProtectedRoute>
            <AppLayout>
              <ManageWorkspace />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/manage-workspace/:workspaceId" element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceDetailView />
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

        {/* Workspace Internal Routes */}
        <Route path="/workspace/:workspaceId" element={
          <ProtectedRoute>
            <AppLayout>
              <WorkspaceLayout />
            </AppLayout>
          </ProtectedRoute>
        }>
          <Route path="overview" element={<WorkspaceOverview />} />
          <Route path="members" element={<WorkspaceMembersInternal />} />
          <Route path="attendance" element={
            <WorkspaceAttendanceWrapper />
          } />
          <Route path="projects" element={<WorkspaceProjects />} />
          <Route path="profile" element={<WorkspaceProfile />} />
          <Route path="clients" element={<WorkspaceClients />} />
          <Route path="requests" element={<WorkspaceRequests />} />
          <Route path="collaborate" element={<WorkspaceCollaborate />} />
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

        <Route path="/goals" element={
          <ProtectedRoute>
            <AppLayout>
              <GoalsPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={
          <ProtectedRoute>
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/mail" element={
          <ProtectedRoute>
            <AppLayout>
              <InboxPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/notes" element={
          <ProtectedRoute>
            <NotesPage />
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
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <AppProvider>
          <ThemeProvider>
            <DockProvider>
              <PlannerProvider>
                <TrackerProvider>
                  <AppContent />
                </TrackerProvider>
              </PlannerProvider>
            </DockProvider>
          </ThemeProvider>
        </AppProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
