import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddStaffModal from '../modals/AddStaffModal';
import '../../styles/AdminDashboard.css';
import {
  Home, Users, Calendar, Stethoscope, Building,
  Briefcase, Settings, HelpCircle, LogOut, MoreVertical,
  Edit, Trash2, Plus
} from 'lucide-react';
import config from '../../config';

const Sidebar = ({ activePage, setActivePage, onLogout }) => (
  <div className="sidebar">
    <h2 className="logo">Medicae</h2>
    <ul className="nav-list">
      {[
        { name: 'Overview', icon: <Home size={20} /> },
        { name: 'Patients', icon: <Users size={20} /> },
        { name: 'Appointments', icon: <Calendar size={20} /> },
        { name: 'Doctors', icon: <Stethoscope size={20} /> },
        { name: 'Departments', icon: <Building size={20} /> },
        { name: 'Staff', icon: <Briefcase size={20} /> },
        { name: 'Settings', icon: <Settings size={20} /> },
        { name: 'Help & support', icon: <HelpCircle size={20} /> },
      ].map(({ name, icon }) => (
        <li
          key={name}
          className={name === activePage ? 'active' : ''}
          onClick={() => setActivePage(name)}
        >
          {icon} {name}
        </li>
      ))}
    </ul>
    <button className="logout-button" onClick={onLogout}>
      <LogOut size={20} /> Logout
    </button>
  </div>
);

const Header = ({ onAddStaffClick }) => (
  <header className="header">
    <h1>Doctors</h1>
    <button className="add-button" onClick={onAddStaffClick}>
      <Plus size={16} /> Add Staff
    </button>
  </header>
);

const DoctorStats = ({ totalDoctors, activeDoctors, inactiveDoctors }) => (
  <div className="card doctor-stats">
    <div className="card-header">
      <h3>Doctor Stats</h3>
      <MoreVertical />
    </div>
    <div className="stat-container">
      {[
        { label: 'Total doctor', value: totalDoctors, icon: <Users size={16} /> },
        { label: 'Active doctor', value: activeDoctors, icon: <Users size={16} /> },
        { label: 'Inactive doctor', value: inactiveDoctors, icon: <Users size={16} /> },
      ].map(({ label, value, icon }) => (
        <div key={label} className="stat-item">
          <div className="stat-icon">{icon}</div>
          <div className="stat-info">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DoctorsJoined = ({ doctors }) => (
  <div className="card doctors-joined">
    <div className="card-header">
      <h3>Doctors Joined</h3>
      <MoreVertical />
    </div>
    <ul className="doctor-list">
      {doctors.map(({ staffID, fullName, role, startDate }) => (
        <li key={staffID} className="doctor-item">
          <div className="doctor-avatar"></div>
          <div className="doctor-info">
            <div className="doctor-name">{fullName}</div>
            <div className="doctor-specialty">{role}</div>
          </div>
          <div className="doctor-time">{new Date(startDate).toLocaleDateString()}</div>
        </li>
      ))}
    </ul>
  </div>
);

const Clinics = () => (
  <div className="card clinics">
    <div className="card-header">
      <h3>Clinics</h3>
      <MoreVertical />
    </div>
    <ul className="clinic-list">
      {[
        { name: 'City General Hospital', location: 'Downtown, City Center' },
        { name: 'Greenview Medical Center', location: 'Uptown, North District' },
        { name: 'Riverside Health Clinic', location: 'Riverside, East End' },
      ].map(({ name, location }) => (
        <li key={name} className="clinic-item">
          <div className="clinic-image"></div>
          <div className="clinic-info">
            <div className="clinic-name">{name}</div>
            <div className="clinic-location">{location}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const StaffList = ({ staff, activeTab, setActiveTab }) => (
  <div className="card staff-list">
    <div className="card-header">
      <div className="tab-nav">
        {['Patients', 'Doctors', 'Nurses', 'Staff'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {staff
          .filter(member => member.role === activeTab.slice(0, -1))
          .map(({ staffID, fullName, department, status }) => (
            <tr key={staffID}>
              <td>
                <div className="user-info">
                  <div className="user-avatar"></div>
                  <span>{fullName}</span>
                </div>
              </td>
              <td>{department}</td>
              <td className={`status ${status.toLowerCase()}`}>{status}</td>
              <td>
                <button className="action-button"><Edit size={16} /></button>
                <button className="action-button"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

const AdminDashboard = ({ onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState('Doctors');
  const [activePage, setActivePage] = useState('Overview');

  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${config.API_BASE_URL}/staff/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStaff(response.data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, []);

  // Calculate doctor statistics
  const totalDoctors = staff.filter(({ role }) => role === 'Doctor').length;
  const activeDoctors = staff.filter(({ role, status }) => role === 'Doctor' && status === 'active').length;
  const inactiveDoctors = staff.filter(({ role, status }) => role === 'Doctor' && status === 'inactive').length;

  const handleAddStaff = (newStaff) => {
    setStaff([...staff, newStaff]);
  };

  return (
    <div className="dashboard">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <div className="main-content">
        <Header onAddStaffClick={() => setShowModal(true)} />
        <div className="dashboard-grid">
          <div className="left-column">
            <DoctorStats
              totalDoctors={totalDoctors}
              activeDoctors={activeDoctors}
              inactiveDoctors={inactiveDoctors}
            />
            <DoctorsJoined doctors={staff.filter(s => s.role === 'Doctor')} />
            <Clinics />
          </div>
          <div className="right-column">
            <StaffList staff={staff} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onAddStaff={handleAddStaff} />}
    </div>
  );
};

export default AdminDashboard;
