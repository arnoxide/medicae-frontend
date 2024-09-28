import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Topbar from './components/Topbar';
import './App.css';
import AdminDashboard from './components/AdminDashboard';
import DoctorsDashboard from './components/DoctorsDashboard';
import NursesDashboard from './components/NursesDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import PatientsDashboard from './components/PatientsDashboard';
import Login from './components/Login';

const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const [page, setPage] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    let pageName = '';

    switch (path) {
      case '/admin':
        pageName = 'Admin Dashboard';
        break;
      case '/doctor':
        pageName = 'Doctors Dashboard';
        break;
      case '/nurse':
        pageName = 'Nurses Dashboard';
        break;
      case '/receptionist':
        pageName = 'Receptionist Dashboard';
        break;
      case '/patient':
        pageName = 'Patients Dashboard';
        break;
      default:
        pageName = 'Dashboard';
    }
    setPage(pageName);
  }, [location.pathname]);

  return (
    <>
      {localStorage.getItem('token') && location.pathname !== '/login' && (
        <Topbar heading={page} isSidebarCollapsed={isSidebarCollapsed} onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }} />
      )}
      {children}
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  return (
    <Router>
      <div className="App">
        <PageWrapper>
          <div className="content">
            <Routes>
              <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
              <Route path="/doctor" element={<ProtectedRoute element={<DoctorsDashboard />} />} />
              <Route path="/nurse" element={<ProtectedRoute element={<NursesDashboard />} />} />
              <Route path="/receptionist" element={<ProtectedRoute element={<ReceptionistDashboard />} />} />
              <Route path="/patient" element={<ProtectedRoute element={<PatientsDashboard />} />} />
              <Route path="/" element={<Navigate to={`/${userRole.toLowerCase()}`} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to={isLoggedIn ? `/${userRole.toLowerCase()}` : '/login'} />} />
            </Routes>
          </div>
        </PageWrapper>
      </div>
    </Router>
  );
}

export default App;
