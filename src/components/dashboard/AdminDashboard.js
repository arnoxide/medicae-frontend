import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddStaffModal from '../modals/AddStaffModal';
import AddPatientModal from '../modals/AddPatientModal';
import AddFileModal from '../modals/AddFileModal';
import PatientList from '../patient/PatientList';
import PatientFile from '../patient/PatientFile';
import Appointments from '../patient/Appointments';
import PatientFileList from '../patient/PatientFileList';
import '../../styles/AdminDashboard.css';
import {
  Home, Users, Calendar, Stethoscope, Building, Briefcase,
  Settings, HelpCircle, LogOut, MoreVertical,
  Edit, Trash2, Plus, FileText
} from 'lucide-react';
import config from '../../config';

const Sidebar = ({ activePage, setActivePage, onLogout }) => (
  <div className="sidebar">
    <h2 className="logo">Medicae</h2>
    <ul className="nav-list">
      {[
        { name: 'Overview', icon: <Home size={20} /> },
        { name: 'Patients', icon: <Users size={20} /> },
        { name: 'Patients File', icon: <FileText size={20} /> },
        { name: 'Appointments', icon: <Calendar size={20} /> },
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

const HelpAndSupport = () => (
  <div className="help-support">
    <h2>Help & Support</h2>
    <p>If you need assistance, please contact our support team:</p>
    <ul>
      <li>Email: support@medicae.com</li>
      <li>Phone: 1-800-555-HELP</li>
      <li>Live Chat: Available 24/7 via the chat icon in the bottom right corner.</li>
    </ul>
    <h3>Frequently Asked Questions</h3>
    <ul>
      <li>How do I reset my password?</li>
      <p>Go to the settings page and click "Reset Password".</p>
      <li>How can I update my profile information?</li>
      <p>Navigate to your profile page and click "Edit Profile".</p>
    </ul>
    <p>For further assistance, please visit our <a href="/faq">FAQ page</a>.</p>
  </div>
);


const AdminDashboard = ({ onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('Doctors');
  const [activePage, setActivePage] = useState('Overview');
  const [modalType, setModalType] = useState('');
  const [viewingFile, setViewingFile] = useState(null);
  const [patientToAddFile, setPatientToAddFile] = useState(null);

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

  useEffect(() => {
    if (activePage === 'Patients') {
      const fetchPatients = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`${config.API_BASE_URL}/patients`, {
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
    alert('Patient added successfully!');
  };

  const handleAddStaff = (newStaff) => {
    setStaff([...staff, newStaff]);
  };

  const handleViewFile = async (patientId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${config.API_BASE_URL}/patient-files/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setViewingFile(patientId);
      } else {
        setPatientToAddFile(patientId);
        setShowModal(true);
        setModalType('file');
      }
    } catch (error) {
      console.error('Error checking patient file:', error);
      setPatientToAddFile(patientId);
      setShowModal(true);
      setModalType('file');
    }
  };

  const handleAddFile = (newFile) => {
    setPatients(patients.map(patient =>
      patient._id === newFile.patientId ? { ...patient, hasFile: 1 } : patient
    ));
    setShowModal(false);
    setPatientToAddFile(null);
    alert('File added successfully!');
  };

  const totalDoctors = staff.filter(({ role }) => role === 'Doctor').length;
  const activeDoctors = staff.filter(({ role, status }) => role === 'Doctor' && status === 'active').length;
  const inactiveDoctors = staff.filter(({ role, status }) => role === 'Doctor' && status === 'inactive').length

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
            )}
            {activePage === 'Patients' && (
              <>
                <Header onAddClick={() => { setShowModal(true); setModalType('patient'); }} buttonText="Add Patient" />
                <PatientList patients={patients} onViewFile={handleViewFile} onAddFile={(patientId) => { setPatientToAddFile(patientId); setShowModal(true); setModalType('file'); }} />
              </>
            )}
            {activePage === 'Patients File' && (
              <div className="patient-file-page">
                <h1>Patients with Files</h1>
                <PatientFileList patients={patients} />
              </div>
            )}
            {activePage === 'Appointments' && (
              <Appointments />
            )}
            {activePage === 'Help & support' && (
              <HelpAndSupport />
            )}
          </>
        )}
      </div>
      {showModal && modalType === 'patient' && <AddPatientModal onClose={() => setShowModal(false)} onAddPatient={handleAddPatient} />}
      {showModal && modalType === 'file' && (
        <AddFileModal
          patientId={patientToAddFile}
          role="receptionist"
          onClose={() => { setShowModal(false); setPatientToAddFile(null); }}
          onAddFile={handleAddFile}
        />
      )}
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onAddStaff={handleAddStaff} />}
    </div>
  );
};

export default AdminDashboard;
