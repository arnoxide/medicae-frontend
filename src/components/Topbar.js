import React, { useState } from 'react';
import '../styles/Topbar.css';
import { FaSearch, FaPlus, FaQuestionCircle, FaHeartbeat, FaCog, FaFlag, FaCaretDown } from 'react-icons/fa';

const roleColors = {
  admin: '#4a90e2',
  doctor: '#58b368',
  nurse: '#f5a623',
  receptionist: '#018749',
  patient: '#9013fe'
};

const Topbar = ({ heading, role, isSidebarCollapsed, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`topbar ${isSidebarCollapsed ? 'full-width' : ''}`} style={{ backgroundColor: roleColors[role.toLowerCase()] }}>
      <div className="page-heading">
        <h2>{heading}</h2>
      </div>
      <div className="topbar-center">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search for anything here..." />
        </div>
      </div>
      <div className="topbar-right">
        <div className="icons">
          <FaPlus className="icon" />
          <FaQuestionCircle className="icon" />
          <FaHeartbeat className="icon" />
          <FaCog className="icon" />
          <div className="flag-status">
            <FaFlag className="icon" />
          </div>
        </div>
        <div className="separator"></div>
        <div className="user-profile" onClick={toggleDropdown}>
          <img src="https://i.pinimg.com/564x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg" alt="User" className="user-image" />
          <div className="user-info">
            <span className="user-name">Nwovhe Nduvho</span>
            <FaCaretDown className="dropdown-icon" />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <ul>
                  <li>Profile</li>
                  <li>Settings</li>
                  <li onClick={onLogout}>Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
