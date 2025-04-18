import React from 'react';
import ProtectedRoute from './routes/ProtectedRoute';
import MemberApprovals from './pages/MemberApprovals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { AuthProvider } from './contexts/AuthContext';
import { ActivityLogProvider } from './contexts/ActivityLogContext';
import Layout from './components/layout/Layout';
import SignIn from './components/auth/SignIn';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Resources from './pages/Resources';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PermissionsControl from './pages/PermissionsControl';
import Calendar from './pages/Calendar';
import MarketingPage from './pages/MarketingPage';
import PRPage from './pages/PRPage';
import GraphicsPage from './pages/GraphicsPage';

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <ActivityLogProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Layout />}>
                {/* Dashboard - Requires dashboard.view permission */}
                <Route index element={
                  <ProtectedRoute requiredPermission="dashboard.view">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* Projects - Requires projects.view permission */}
                <Route path="projects" element={
                  <ProtectedRoute requiredPermission="projects.view">
                    <Projects />
                  </ProtectedRoute>
                } />
                
                {/* Tasks - Requires tasks.view permission */}
                <Route path="tasks" element={
                  <ProtectedRoute requiredPermission="tasks.view">
                    <Tasks />
                  </ProtectedRoute>
                } />
                
                {/* Team - Requires team.view permission */}
                <Route path="team" element={
                  <ProtectedRoute requiredPermission="team.view">
                    <Team />
                  </ProtectedRoute>
                } />
                
                {/* Resources - Requires resources.view permission */}
                <Route path="resources" element={
                  <ProtectedRoute requiredPermission="resources.view">
                    <Resources />
                  </ProtectedRoute>
                } />
                
                {/* Reports - Requires reports.view permission */}
                <Route path="reports" element={
                  <ProtectedRoute requiredPermission="reports.view">
                    <Reports />
                  </ProtectedRoute>
                } />
                
                {/* Marketing - Requires marketing.view permission */}
                <Route path="marketing" element={
                  <ProtectedRoute requiredPermission="marketing.view">
                    <MarketingPage />
                  </ProtectedRoute>
                } />
                
                {/* PR - Requires pr.view permission */}
                <Route path="pr" element={
                  <ProtectedRoute requiredPermission="pr.view">
                    <PRPage />
                  </ProtectedRoute>
                } />
                
                {/* Graphics - Requires graphics.view permission */}
                <Route path="graphics" element={
                  <ProtectedRoute requiredPermission="graphics.view">
                    <GraphicsPage />
                  </ProtectedRoute>
                } />
                
                {/* Calendar - Requires calendar.view permission */}
                <Route path="calendar" element={
                  <ProtectedRoute requiredPermission="calendar.view">
                    <Calendar />
                  </ProtectedRoute>
                } />
                
                {/* Settings - No permission required */}
                <Route path="settings" element={<Settings />} />
                
                {/* Member Approvals - Requires admin.approveMembers permission */}
                <Route path="member-approvals" element={
                  <ProtectedRoute requiredPermission="admin.approveMembers">
                    <MemberApprovals />
                  </ProtectedRoute>
                } />
                
                {/* Permissions - Requires admin.managePermissions permission */}
                <Route path="permissions" element={
                  <ProtectedRoute requiredPermission="admin.managePermissions">
                    <PermissionsControl />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </Router>
        </ActivityLogProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;