import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddPatientModal from './AddPatientModal';
import AddStaffModal from './AddStaffModal';
import PatientFile from './PatientFile';
import '../styles/ReceptionistDashboard.css';
import {
  Home, Users, Calendar, Stethoscope, Building, Briefcase,
  Settings, HelpCircle, LogOut, Plus, MoreVertical, Edit, Trash2, FileText
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, onLogout }) => (
  <div className="sidebar">
    <h2 className="logo">Medicae</h2>
    <ul className="nav-list">
      {[
        { name: 'Overview', icon: <Home size={20} /> },
        { name: 'Patients', icon: <Users size={20} /> },
        { name: 'Patients File', icon: <FileText size={20} /> },
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

const Header = ({ onAddClick, buttonText }) => (
  <header className="header">
    <h1>{buttonText === 'Add Patient' ? 'Patients' : 'Doctors'}</h1>
    <button className="add-button" onClick={onAddClick}>
      <Plus size={16} /> {buttonText}
    </button>
  </header>
);

const DoctorStats = () => (
  <div className="card doctor-stats">
    <div className="card-header">
      <h3>Doctor Stats</h3>
      <MoreVertical />
    </div>
    <div className="stat-container">
      {[
        { label: 'Total doctor', value: '300k', icon: <Users size={16} /> },
        { label: 'Active doctor', value: '200k', icon: <Users size={16} /> },
        { label: 'Inactive doctor', value: '100k', icon: <Users size={16} /> },
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

const PatientList = ({ patients, onViewFile }) => (
  <div className="card patient-list">
    <div className="card-header">
      <h3>Patients</h3>
    </div>
    <table>
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Date of Birth</th>
          <th>Address</th>
          <th>Phone Number</th>
          <th>Email</th>
          <th>Action</th> {/* New column */}
        </tr>
      </thead>
      <tbody>
        {patients.map(({ _id, firstName, lastName, dateOfBirth, address, phoneNumber, email }) => (
          <tr key={_id}>
            <td>{firstName}</td>
            <td>{lastName}</td>
            <td>{new Date(dateOfBirth).toLocaleDateString()}</td>
            <td>{address}</td>
            <td>{phoneNumber}</td>
            <td>{email}</td>
            <td>
              <button onClick={() => onViewFile(_id)}>View File</button> {/* New action */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

const ReceptionistDashboard = ({ onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState('Doctors');
  const [activePage, setActivePage] = useState('Overview');
  const [modalType, setModalType] = useState('');
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/staff/all', {
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

  useEffect(() => {
    if (activePage === 'Patients') {
      const fetchPatients = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get('http://localhost:5000/api/patients', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setPatients(response.data);
        } catch (error) {
          console.error('Error fetching patients:', error);
        }
      };

      fetchPatients();
    }
  }, [activePage]);

  const handleAddPatient = (newPatient) => {
    setPatients([...patients, newPatient]);
  };

  const handleAddStaff = (newStaff) => {
    setStaff([...staff, newStaff]);
  };

  const handleViewFile = (patientId) => {
    setViewingFile(patientId);
  };

  return (
    <div className="dashboard">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <div className="main-content">
        {viewingFile ? (
          <PatientFile patientId={viewingFile} role="receptionist" />
        ) : (
          <>
            {activePage === 'Overview' && (
              <div className="dashboard-grid">
                <div className="left-column">
                  <DoctorStats />
                  <DoctorsJoined doctors={staff.filter(s => s.role === 'Doctor')} />
                  <Clinics />
                </div>
                <div className="right-column">
                  <StaffList staff={staff} activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
              </div>
            )}
            {activePage === 'Patients' && (
              <>
                <Header onAddClick={() => { setShowModal(true); setModalType('patient'); }} buttonText="Add Patient" />
                <PatientList patients={patients} onViewFile={handleViewFile} />
              </>
            )}
            {activePage === 'Patients File' && (
              <div className="patient-file-page">
                <h1>Select a patient to view their file</h1>
                <PatientList patients={patients} onViewFile={handleViewFile} />
              </div>
            )}
            {/* Other pages */}
          </>
        )}
      </div>
      {showModal && modalType === 'patient' && <AddPatientModal onClose={() => setShowModal(false)} onAddPatient={handleAddPatient} />}
      {showModal && modalType === 'staff' && <AddStaffModal onClose={() => setShowModal(false)} onAddStaff={handleAddStaff} />}
    </div>
  );
};

export default ReceptionistDashboard;
