import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Marks from './pages/Marks';
import Teachers from './pages/Teachers';
import StudentProfile from './pages/StudentProfile';
import './index.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const RoleBasedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[];
  fallbackPath?: string;
}> = ({ children, allowedRoles, fallbackPath = "/dashboard" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Students />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/marks"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                  <Marks />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Teachers />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </RoleBasedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
