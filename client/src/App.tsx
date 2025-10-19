import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './components/Auth';
import HomePage from './components/HomePage';
import ProjectsPage from './components/ProjectsPage';
import ProjectViewDetailed from './components/ProjectViewDetailed';
import PlannerPage from './components/PlannerPage';
import Dashboard from './components/Dashboard';
import TrackerPage from './components/TrackerPage';
import RemindersPage from './components/RemindersPage';
import ReportsPage from './components/ReportsPage';
import TeamPage from './components/TeamPage';
import GoalsPage from './components/GoalsPage';
import SettingsSection from './components/SettingsSection';
import ProfileSection from './components/ProfileSection';
import WorkspaceDiscover from './components/WorkspaceDiscover';
import WorkspaceOwner from './components/WorkspaceOwner';
import WorkspaceMember from './components/WorkspaceMember';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ProjectManagementView from './components/ProjectManagementView';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import NotificationsPanel from './components/NotificationsPanel';
import TaskDrawer from './components/TaskDrawer';
import TaskManagement from './components/TaskManagement';
import LandingPage from './components/LandingPage';
import About from './components/About';
import UserGuide from './components/UserGuide';

// Import all modals
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import CreateProjectModal from './components/CreateProjectModal';
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
    <div className="min-h-screen">
      <Header />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

// App Content Component
const AppContent: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="antialiased bg-bg text-text font-inter selection-bg-primary">
      <ToastContainer />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        
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
        
        <Route path="/project/:projectId" element={
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
            <AppLayout>
              <PlannerPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/tracker" element={
          <ProtectedRoute>
            <AppLayout>
              <TrackerPage />
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
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
