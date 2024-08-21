import React, { useState } from 'react';
import '../styles/Sidebar.css';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaClinicMedical, FaCalendarCheck, FaUserFriends, FaStethoscope, FaUserMd, FaMoneyBill, FaChartLine, FaShoppingCart, FaCreditCard, FaWarehouse, FaHeadset, FaFileAlt } from 'react-icons/fa';

const Sidebar = ({ page, setPage, isCollapsed, setIsCollapsed }) => {
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/path/to/logo.png" alt="Logo" className={`logo ${isCollapsed ? 'collapsed' : ''}`} />
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
            <li onClick={() => setPage('Reservations')} className={page === 'Reservations' ? 'active' : ''}>
              <FaCalendarCheck />
              {!isCollapsed && <span>Reservations</span>}
            </li>
            <li onClick={() => setPage('Patients')} className={page === 'Patients' ? 'active' : ''}>
              <FaUserFriends />
              {!isCollapsed && <span>Patients</span>}
            </li>
            <li onClick={() => setPage('Treatments')} className={page === 'Treatments' ? 'active' : ''}>
              <FaStethoscope />
              {!isCollapsed && <span>Treatments</span>}
            </li>
            <li onClick={() => setPage('Staff List')} className={page === 'Staff List' ? 'active' : ''}>
              <FaUserMd />
              {!isCollapsed && <span>Staff List</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'FINANCE'}</li>
            <li onClick={() => setPage('Accounts')} className={page === 'Accounts' ? 'active' : ''}>
              <FaMoneyBill />
              {!isCollapsed && <span>Accounts</span>}
            </li>
            <li onClick={() => setPage('Sales')} className={page === 'Sales' ? 'active' : ''}>
              <FaChartLine />
              {!isCollapsed && <span>Sales</span>}
            </li>
            <li onClick={() => setPage('Purchases')} className={page === 'Purchases' ? 'active' : ''}>
              <FaShoppingCart />
              {!isCollapsed && <span>Purchases</span>}
            </li>
            <li onClick={() => setPage('Payment Method')} className={page === 'Payment Method' ? 'active' : ''}>
              <FaCreditCard />
              {!isCollapsed && <span>Payment Method</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'PHYSICAL ASSET'}</li>
            <li onClick={() => setPage('Stocks')} className={page === 'Stocks' ? 'active' : ''}>
              <FaWarehouse />
              {!isCollapsed && <span>Stocks</span>}
            </li>
            <li onClick={() => setPage('Peripherals')} className={page === 'Peripherals' ? 'active' : ''}>
              <FaHeadset />
              {!isCollapsed && <span>Peripherals</span>}
            </li>
            <li className="section-title">{!isCollapsed && 'OTHERS'}</li>
            <li onClick={() => setPage('Report')} className={page === 'Report' ? 'active' : ''}>
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