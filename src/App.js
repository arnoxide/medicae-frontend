import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Topbar from './components/common/Topbar';
import './App.css';
import AdminDashboard from './components/dashboard/AdminDashboard';
import DoctorsDashboard from './components/dashboard/DoctorsDashboard';
import NursesDashboard from './components/dashboard/NursesDashboard';
import ReceptionistDashboard from './components/dashboard/ReceptionistDashboard';
import PatientsDashboard from './components/dashboard/PatientsDashboard';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import { LoaderProvider } from './context/LoaderContext';
import Loader from './components/common/Loader';
import PatientFile from './components/patient/PatientFile';
import ViewFile from './components/patient/ViewFile';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [page, setPage] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setPage(role + ' Dashboard');
    }
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setPage(role + ' Dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole('');
    setPage('Login');
  };

  return (
    <LoaderProvider>
      <Router>
        <div className="App">
          {isLoggedIn && window.location.pathname !== '/login' && (
            <Topbar heading={page} role={userRole} isSidebarCollapsed={isSidebarCollapsed} onLogout={handleLogout} />
          )}
          <div className="content">
            <Routes>
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/doctor" element={<ProtectedRoute><DoctorsDashboard onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/nurse" element={<ProtectedRoute><NursesDashboard onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/receptionist" element={<ProtectedRoute><ReceptionistDashboard onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/patient" element={<ProtectedRoute><PatientsDashboard onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/patient-file" element={<ProtectedRoute><PatientFile onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/view-file" element={<ProtectedRoute><ViewFile onLogout={handleLogout} /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/" element={<Navigate to={isLoggedIn ? `/${userRole.toLowerCase()}` : '/login'} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to={isLoggedIn ? `/${userRole.toLowerCase()}` : '/login'} />} />
            </Routes>
          </div>
        </div>
        <Loader />
      </Router>
    </LoaderProvider>
  );
}

export default App;
