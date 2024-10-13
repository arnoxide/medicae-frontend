import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Calendar, Stethoscope, Building, Briefcase, Settings, HelpCircle, LogOut, FileText } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, onLogout }) => (
  <div className="sidebar">
    <h2 className="logo">Medicae</h2>
    <ul className="nav-list">
      <li className={activePage === 'Overview' ? 'active' : ''}>
        <Link to="/" onClick={() => setActivePage('Overview')}>
          <Home size={20} /> Overview
        </Link>
      </li>
      <li className={activePage === 'Patients' ? 'active' : ''}>
        <Link to="/patients" onClick={() => setActivePage('Patients')}>
          <Users size={20} /> Patients
        </Link>
      </li>
      <li className={activePage === 'Patients File' ? 'active' : ''}>
        <Link to="/patients-file" onClick={() => setActivePage('Patients File')}>
          <FileText size={20} /> Patients File
        </Link>
      </li>
      <li className={activePage === 'Appointments' ? 'active' : ''}>
        <Link to="/appointments" onClick={() => setActivePage('Appointments')}>
          <Calendar size={20} /> Appointments
        </Link>
      </li>
      <li className={activePage === 'Doctors' ? 'active' : ''}>
        <Link to="/doctors" onClick={() => setActivePage('Doctors')}>
          <Stethoscope size={20} /> Doctors
        </Link>
      </li>
      <li className={activePage === 'Departments' ? 'active' : ''}>
        <Link to="/departments" onClick={() => setActivePage('Departments')}>
          <Building size={20} /> Departments
        </Link>
      </li>
      <li className={activePage === 'Staff' ? 'active' : ''}>
        <Link to="/staff" onClick={() => setActivePage('Staff')}>
          <Briefcase size={20} /> Staff
        </Link>
      </li>
      {/* Add more links as needed */}
    </ul>
    <button className="logout-button" onClick={onLogout}>
      <LogOut size={20} /> Logout
    </button>
  </div>
);

export default Sidebar;
