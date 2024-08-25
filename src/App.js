import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import './App.css';
import Reservations from './components/Reservations';
import Patients from './components/Patients';
import Treatments from './components/Treatments';
import StaffList from './components/StaffList';
import Accounts from './components/Accounts';
import Purchases from './components/Purchases';
import PaymentMethods from './components/PaymentMethods';
import Stocks from './components/Stocks';
import MedicineDeliveryManagement from './components/MedicineDeliveryManagement';
import Reports from './components/Reports';
import PatientFiles from './components/PatientFiles';

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
          {page === 'Reservations' && <Reservations />}
          {page === 'Patients' && <Patients />}
          {page === 'Treatments' && <Treatments />}
          {page === 'StaffList' && <StaffList />}
          {page === 'Accounts' && <Accounts />}
          {page === 'Purchases' && <Purchases />}
          {page === 'PaymentMethods' && <PaymentMethods />}
          {page === 'Stocks' && <Stocks />}
          {page === 'MedicineDeliveryManagement' && <MedicineDeliveryManagement />}
          {page === 'Reports' && <Reports />}
          {page === 'PatientFiles' && <PatientFiles />}
        </div>
      </div>
    </div>
  );
}

export default App;
