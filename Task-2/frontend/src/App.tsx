import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { client } from './graphql/client';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Marks from './pages/Marks';
import StudentProfile from './pages/StudentProfile';
import './index.css';

// Private Route Component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role Based Route Component
const RoleBasedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[] 
}> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (allowedRoles.includes(payload.role)) {
      return <>{children}</>;
    }
  } catch (error) {
    console.error('Token parsing error:', error);
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ApolloProvider client={client}>
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
                    <RoleBasedRoute allowedRoles={['admin', 'teacher', 'student']}>
                      <Dashboard />
                    </RoleBasedRoute>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/students" 
                element={
                  <PrivateRoute>
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                      <Students />
                    </RoleBasedRoute>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/teachers" 
                element={
                  <PrivateRoute>
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Teachers />
                    </RoleBasedRoute>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/marks" 
                element={
                  <PrivateRoute>
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                      <Marks />
                    </RoleBasedRoute>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <RoleBasedRoute allowedRoles={['student']}>
                      <StudentProfile />
                    </RoleBasedRoute>
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
