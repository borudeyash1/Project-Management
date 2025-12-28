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
import NotificationsPage from './components/NotificationsPage';
import ReportsPage from './components/ReportsPage';
import TeamPage from './components/TeamPage';
import GoalsPage from './components/GoalsPage';
import SettingsSection from './components/SettingsSection';
import ProfileSection from './components/ProfileSection';
import WorkspaceDiscover from './components/WorkspaceDiscover';
import WorkspaceOwner from './components/WorkspaceOwner';
import WorkspaceMember from './components/WorkspaceMember';
import ManageWorkspace from './components/ManageWorkspace';
import DropboxWidget from './components/vault/DropboxWidget';
import SpotifyWidget from './components/music/SpotifyWidget';
import NotionWidget from './components/notion/NotionWidget'; // [NEW] Import
import JiraWidget from './components/jira/JiraWidget'; // [NEW] Import
import ZendeskWidget from './components/zendesk/ZendeskWidget'; // [NEW] Import
import SlackWidget from './components/slack/SlackWidget'; // [NEW] Import
import MusicPage from './pages/MusicPage';
import ProjectDesignHub from './components/project/ProjectDesignHub';
import WorkspaceDetailView from './components/WorkspaceDetailView';
import WorkspaceLayout from './components/workspace/WorkspaceLayout';
import WorkspaceOverview from './components/workspace/WorkspaceOverview';
import WorkspaceMembers from './components/workspace/WorkspaceMembers';
import WorkspaceMembersInternal from './components/workspace/WorkspaceMembersInternal';
import WorkspaceProjects from './components/workspace/WorkspaceProjects';
import WorkspaceDesignTab from './components/workspace/WorkspaceDesignTab';
import WorkspaceJiraTab from './components/workspace/WorkspaceJiraTab';
import WorkspaceNotionTab from './components/workspace/WorkspaceNotionTab';
import WorkspaceClients from './components/workspace/WorkspaceClients';
import WorkspaceRequests from './components/workspace/WorkspaceRequests';
import WorkspaceCollaborate from './components/workspace/WorkspaceCollaborate';
import WorkspaceSettings from './components/workspace/WorkspaceSettings';
import WorkspaceInbox from './components/workspace/WorkspaceInbox';
import WorkspaceProfile from './components/workspace/WorkspaceProfile';
import WorkspaceAttendanceTab from './components/workspace-detail/WorkspaceAttendanceTab';
import WorkspaceZendeskTab from './components/workspace-detail/WorkspaceZendeskTab'; // [NEW]
import ZendeskTicketDetail from './components/zendesk/ZendeskTicketDetail'; // [NEW]
import WorkspaceSlackTab from './components/workspace-detail/WorkspaceSlackTab'; // [NEW]
import WorkspaceLinearTab from './components/workspace-detail/WorkspaceLinearTab'; // [NEW]
import ProjectLayout from './components/project/ProjectLayout';
import ProjectOverview from './components/project/ProjectOverview';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ProjectManagementView from './components/ProjectManagementView';
import Header from './components/Header';
import DockNavigation from './components/DockNavigation';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
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
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
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
import AdminDocsImport from './components/admin/AdminDocsImport';
import AdminContent from './components/admin/AdminContent';
import CanvasEditorPage from './components/admin/CanvasEditorPage';
import FolderDemo from './components/FolderDemo';
import CalendarPage from './components/calendar/CalendarPage';
import InboxPage from './components/mail/InboxPage';
import NotesPage from './components/NotesPage';
import MeetingNotesPage from './components/MeetingNotesPage';
import RefundPolicy from './components/RefundPolicy';
import TermsConditions from './components/TermsConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import ShippingPolicy from './components/ShippingPolicy';
import ContactUs from './components/ContactUs';
import DropboxBrowser from './components/vault/DropboxBrowser'; // [NEW] Import
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
import { StickyNotesProvider } from './context/StickyNotesContext';
import StickyNotesContainer from './components/StickyNotesContainer';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useApp();

  if (state.isAuthLoading) {
    return <LoadingAnimation fullScreen message="Authenticating..." />;
  }

  // Check if user is authenticated - add null check
  const isAuthenticated = state.userProfile && !!state.userProfile._id;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const WorkspaceAttendanceWrapper: React.FC = () => {
  const { workspaceId } = require('react-router-dom').useParams();
  return <WorkspaceAttendanceTab workspaceId={workspaceId || ''} />;
};

const WorkspaceZendeskWrapper: React.FC = () => {
  const { workspaceId } = require('react-router-dom').useParams();
  return <WorkspaceZendeskTab workspaceId={workspaceId || ''} />;
};

const WorkspaceSlackWrapper: React.FC = () => {
  const { workspaceId } = require('react-router-dom').useParams();
  return <WorkspaceSlackTab workspaceId={workspaceId || ''} />;
};

const WorkspaceLinearWrapper: React.FC = () => {
  const { workspaceId } = require('react-router-dom').useParams();
  return <WorkspaceLinearTab />;
};

// Main App Layout Component with Flexible Dock Positioning
const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { dockPosition, isMobile } = useDock();
  const { state } = useApp();

  const isHorizontalDock = dockPosition === 'left' || dockPosition === 'right';
  const isTopDock = dockPosition === 'top';
  const isBottomDock = dockPosition === 'bottom';

  // Show dock only if not on mobile OR if on mobile and sidebar is collapsed (menu hidden)
  const showDock = !isMobile || state.sidebar.collapsed;

  // For top/bottom: Dock is fixed at viewport edges
  if (!isHorizontalDock) {
    return (
      <div className="h-screen bg-bg dark:bg-gray-900 flex flex-col">
        {/* Dock Header - Fixed at Top */}
        {isTopDock && showDock && (
          <div className="flex-shrink-0 h-12 z-[100] flex justify-between items-center px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {/* AI Button on left for top */}
            <div className="flex-1 flex justify-start">
              <ChatbotButton />
            </div>

            {/* Centered Dock */}
            <div className="flex-shrink-0">
              <DockNavigation />
            </div>

            {state.modals.dropboxWidget && <DropboxWidget />}
            {state.modals.spotifyWidget && <SpotifyWidget />} {/* [NEW] */}
            {/* Empty space on right */}
            <div className="flex-1"></div>
          </div>
        )}

        {/* Main Content Area - Scrollable Section with smooth transition */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ease-in-out">
          <Header />
          <main
            className="flex-1 overflow-y-auto bg-bg dark:bg-gray-900"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
          >
            <style>{`
              main::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className={isBottomDock ? 'pb-16' : ''}>
              {children}
            </div>
          </main>
        </div>

        {/* Dock Footer - Fixed at Bottom */}
        {isBottomDock && showDock && (
          <div className="flex-shrink-0 h-12 z-[100] flex justify-between items-center px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Empty space on left */}
            <div className="flex-1"></div>

            {/* Centered Dock */}
            <div className="flex-shrink-0">
              <DockNavigation />
            </div>

            {/* AI Button on right */}
            <div className="flex-1 flex justify-end">
              <ChatbotButton />
            </div>
          </div>
        )}

        {/* Fixed Components */}
        <ToastContainer />
        <NotificationsPanel />
        <TaskDrawer />
      </div>
    );
  }

  // For left/right: Dock is alongside, content shifts automatically
  return (
    <div className="min-h-screen bg-bg dark:bg-gray-900 flex flex-col">
      {/* Header spans full width */}
      <Header />

      {/* Dock and Content Row */}
      <div className="flex-1 flex">
        {/* Dock at Left */}
        {dockPosition === 'left' && showDock && (
          <div className="flex-shrink-0">
            <DockNavigation />
          </div>
        )}

        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <main className={`h-full bg-bg dark:bg-gray-900 overflow-auto ${dockPosition === 'left' ? 'pl-4' : dockPosition === 'right' ? 'pr-4' : ''}`}>
            {children}
          </main>
        </div>

        {/* Dock at Right */}
        {dockPosition === 'right' && showDock && (
          <div className="flex-shrink-0">
            <DockNavigation />
          </div>
        )}
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
      <StickyNotesContainer />
      <DropboxWidget />
      <SpotifyWidget />
      <NotionWidget /> {/* [NEW] Render Widget */}
      <JiraWidget /> {/* [NEW] Render Jira Widget */}
      <ZendeskWidget /> {/* [NEW] Render Zendesk Widget */}
      <SlackWidget /> {/* [NEW] Render Slack Widget */}
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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
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
        <Route path="/admin/docs/import" element={<AdminDocsImport />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/canvas-editor" element={<CanvasEditorPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <AppLayout>
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
          <Route path="design" element={<ProjectDesignHub />} />
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

        <Route path="/notifications" element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
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
          <Route path="design" element={<WorkspaceDesignTab />} />
          <Route path="jira" element={<WorkspaceJiraTab />} />
          <Route path="notion" element={<WorkspaceNotionTab />} />
          <Route path="notion" element={<WorkspaceNotionTab />} />
          <Route path="zendesk">
            <Route index element={<WorkspaceZendeskWrapper />} />
            <Route path=":ticketId" element={<ZendeskTicketDetail />} />
          </Route>
          <Route path="slack" element={<WorkspaceSlackWrapper />} />
          <Route path="linear" element={<WorkspaceLinearWrapper />} />
          <Route path="profile" element={<WorkspaceProfile />} />
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

        {/* [NEW] Dropbox Vault Route */}
        <Route path="/dropbox" element={
          <ProtectedRoute>
            <AppLayout>
              <DropboxBrowser />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* [NEW] Spotify Music Route - Secured */}
        <Route path="/music" element={
          <ProtectedRoute>
            <AppLayout>
              <MusicPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/notes" element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        } />

        <Route path="/notes/meeting" element={
          <ProtectedRoute>
            <AppLayout>
              <MeetingNotesPage />
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
            <StickyNotesProvider>
              <DockProvider>
                <PlannerProvider>
                  <TrackerProvider>
                    <AppContent />
                  </TrackerProvider>
                </PlannerProvider>
              </DockProvider>
            </StickyNotesProvider>
          </ThemeProvider>
        </AppProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
