import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [page, setPage] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="App">
      <Sidebar page={page} setPage={setPage} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Topbar heading={page} isSidebarCollapsed={isSidebarCollapsed} />
        <div className="content">
          {page === 'Dashboard' && <Dashboard />}
          {/* Add more components for other pages as needed */}
        </div>
      </div>
    </div>
  );
}

export default App;
