import React, { useState } from 'react';
import '../styles/Sidebar.css';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaClinicMedical, FaCalendarCheck, FaUserFriends, FaStethoscope, FaUserMd, FaMoneyBill, FaChartLine, FaShoppingCart, FaCreditCard, FaWarehouse, FaHeadset, FaFileAlt, FaFile } from 'react-icons/fa';

const Sidebar = ({ page, setPage, isCollapsed, setIsCollapsed }) => {
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="https://ideogram.ai/assets/progressive-image/balanced/response/TZvRGYdrRf6zRxq5-Z2C9A" alt="Logo" className={`logo ${isCollapsed ? 'collapsed' : ''}`} />
        {!isCollapsed && <span className="title">Medicae</span>}
        <button onClick={toggleSidebar} className="toggle-btn">
          {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
        </button>
      </div>
      <div className="sidebar-content">
        <div className="clinic-info">
          {!isCollapsed && (
            <>
              <span className="clinic-name">Beconsfield Clinic</span><br></br>
              <span className="clinic-address">Mavhunga Nzhelele, SA</span>
            </>
          )}
        </div>
        <nav className="nav-menu">
          <ul>
            <li onClick={() => setPage('Dashboard')} className={page === 'Dashboard' ? 'active' : ''}>
              <FaClinicMedical />
              {!isCollapsed && <span>Dashboard</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'CLINIC'}</li>
            <li className={page === 'Reservations' ? 'active' : ''} onClick={() => setPage('Reservations')}>
            <FaCalendarCheck />
              Reservations
            </li>
            <li className={page === 'Patients' ? 'active' : ''} onClick={() => setPage('Patients')}>
            <FaUserFriends />
              Patients
            </li>
            <li className={page === 'PatientFiles' ? 'active' : ''} onClick={() => setPage('PatientFiles')}>
            <FaFile />
              Patients Files
            </li>
            <li className={page === 'Treatments' ? 'active' : ''} onClick={() => setPage('Treatments')} >
              <FaStethoscope />
              {!isCollapsed && <span>Treatments</span>}
            </li>
            <li  className={page === 'StaffList' ? 'active' : ''} onClick={() => setPage('StaffList')}>
              <FaUserMd />
              {!isCollapsed && <span>Staff List</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'FINANCE'}</li>
            <li onClick={() => setPage('Accounts')} className={page === 'Accounts' ? 'active' : ''}>
              <FaMoneyBill />
              {!isCollapsed && <span>Accounts</span>}
            </li>
            <li onClick={() => setPage('Purchases')} className={page === 'Purchases' ? 'active' : ''}>
              <FaShoppingCart />
              {!isCollapsed && <span>Purchases</span>}
            </li>
            <li onClick={() => setPage('PaymentMethods')} className={page === 'PaymentMethods' ? 'active' : ''}>
              <FaCreditCard />
              {!isCollapsed && <span>Payment Method</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'PHYSICAL ASSET'}</li>
            <li onClick={() => setPage('Stocks')} className={page === 'Stocks' ? 'active' : ''}>
              <FaWarehouse />
              {!isCollapsed && <span>Stocks</span>}
            </li>
            <li onClick={() => setPage('MedicineDeliveryManagement')} className={page === 'MedicineDeliveryManagement' ? 'active' : ''}>
              <FaHeadset />
              {!isCollapsed && <span>Delivery Management</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'OTHERS'}</li>
            <li onClick={() => setPage('Reports')} className={page === 'Reports' ? 'active' : ''}>
              <FaFileAlt />
              {!isCollapsed && <span>Report</span>}
            </li>
            <li onClick={() => setPage('Customer Support')} className={page === 'Customer Support' ? 'active' : ''}>
              <FaHeadset />
              {!isCollapsed && <span>Customer Support</span>}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;