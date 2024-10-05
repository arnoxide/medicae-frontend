import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Topbar from './components/Topbar';
import './App.css';
import AdminDashboard from './components/AdminDashboard';
import DoctorsDashboard from './components/DoctorsDashboard';
import NursesDashboard from './components/NursesDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import PatientsDashboard from './components/PatientsDashboard';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { LoaderProvider } from './components/LoaderContext';
import Loader from './components/Loader';
import PatientFile from './components/PatientFile';

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? element : <Navigate to="/login" />;
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
              <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard onLogout={handleLogout} />} />} />
              <Route path="/doctor" element={<ProtectedRoute element={<DoctorsDashboard onLogout={handleLogout} />} />} />
              <Route path="/nurse" element={<ProtectedRoute element={<NursesDashboard onLogout={handleLogout} />} />} />
              <Route path="/receptionist" element={<ProtectedRoute element={<ReceptionistDashboard onLogout={handleLogout} />} />} />
              <Route path="/patient" element={<ProtectedRoute element={<PatientsDashboard onLogout={handleLogout} />} />} />
              <Route path="/patient-file" element={<ProtectedRoute element={<PatientFile onLogout={handleLogout} />} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/" element={<Navigate to={isLoggedIn ? `/${userRole.toLowerCase()}` : '/login'} />} />
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
