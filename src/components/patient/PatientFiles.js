import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../styles/PatientFiles.css';

Modal.setAppElement('#root');

const PatientFiles = () => {
  const [patients, setPatients] = useState([
    { id: 1, fileNumber: 'PF-001', name: 'John Doe', idNumber: '1234567891234', fingerprint: 'Fingerprint1', medicalHistory: 'No allergies', status: 'Active' },
    { id: 2, fileNumber: 'PF-002', name: 'Jane Smith', idNumber: '1234567891234', fingerprint: 'Fingerprint2', medicalHistory: 'Diabetic', status: 'Active' },
    // Add more sample data as needed
  ]);

  const [form, setForm] = useState({
    name: '',
    idNumber: '',
    fingerprint: '',
    medicalHistory: '',
    status: 'Active'
  });

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNumber, setAuthNumber] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPatient) {
      setPatients(patients.map(patient => patient.id === selectedPatient.id ? { ...form, id: selectedPatient.id, fileNumber: selectedPatient.fileNumber } : patient));
      setSelectedPatient(null);
    } else {
      setPatients([...patients, { ...form, id: patients.length + 1, fileNumber: `PF-${String(patients.length + 1).padStart(3, '0')}` }]);
    }
    setForm({
      name: '',
      idNumber: '',
      fingerprint: '',
      medicalHistory: '',
      status: 'Active'
    });
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setForm(patient);
  };

  const handleDelete = (id) => {
    setPatients(patients.filter(patient => patient.id !== id));
  };

  const handleAccessRequest = (patient) => {
    setSelectedPatient(patient);
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authNumber === '12345') { // Replace with actual authentication logic
      setIsAccessGranted(true);
      setIsAuthModalOpen(false);
    } else {
      alert('Invalid doctor/nurse number');
    }
  };

  const handleFingerprintScan = () => {
    // Simulate fingerprint scan
    setForm({
      ...form,
      fingerprint: 'FingerprintScanned'
    });
    setIsFingerprintModalOpen(false);
  };

  const applyFilters = (patients) => {
    // Implement filtering logic if needed
    return patients;
  };

  const filteredPatients = applyFilters(patients);

  return (
    <div className="patient-files">
      <div className="files-header">
        <h1>Patient Files Management</h1>
      </div>
      <div className="collapsible-panel">
        <div className="collapsible-header" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
          <h3>{isPanelCollapsed ? 'Show Add/Edit Patient File' : 'Hide Add/Edit Patient File'}</h3>
          <div className={`arrow ${isPanelCollapsed ? 'down' : 'up'}`}></div>
        </div>
        {!isPanelCollapsed && (
          <div className="files-form">
            <form onSubmit={(e) => { e.preventDefault(); setIsFingerprintModalOpen(true); }}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={form.idNumber}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medicalHistory"
                  value={form.medicalHistory}
                  onChange={handleFormChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit">{selectedPatient ? 'Update Patient' : 'Add Patient'}</button>
            </form>
          </div>
        )}
      </div>
      <div className="files-list">
        <h3>Patient Files</h3>
        {filteredPatients.length === 0 ? (
          <p>No patient files available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File Number</th>
                <th>Name</th>
                <th>ID No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.fileNumber}</td>
                  <td>{patient.name}</td>
                  <td>{patient.idNumber.slice(0, 6) + '******'}</td>
                  <td>{patient.status}</td>
                  <td>
                    <button onClick={() => handleAccessRequest(patient)}>Access</button>
                    <button onClick={() => handleEdit(patient)}>Edit</button>
                    <button onClick={() => handleDelete(patient.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal
        isOpen={isAuthModalOpen}
        onRequestClose={() => setIsAuthModalOpen(false)}
        contentLabel="Authentication"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Enter Doctor/Nurse Number</h2>
        <form onSubmit={handleAuthSubmit}>
          <div className="form-group">
            <label>Doctor/Nurse Number</label>
            <input
              type="text"
              value={authNumber}
              onChange={(e) => setAuthNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit">Authenticate</button>
          <button type="button" className="cancel-button" onClick={() => setIsAuthModalOpen(false)}>Cancel</button>
        </form>
      </Modal>
      <Modal
        isOpen={isFingerprintModalOpen}
        onRequestClose={() => setIsFingerprintModalOpen(false)}
        contentLabel="Fingerprint Scan"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Scan Fingerprint</h2>
        <p>Please place your finger on the scanner.</p>
        <button onClick={handleFingerprintScan}>Simulate Fingerprint Scan</button>
        <button type="button" className="cancel-button" onClick={() => setIsFingerprintModalOpen(false)}>Cancel</button>
      </Modal>
      {isAccessGranted && selectedPatient && (
        <div className="patient-details">
          <h3>Patient Details</h3>
          <p><strong>File Number:</strong> {selectedPatient.fileNumber}</p>
          <p><strong>Name:</strong> {selectedPatient.name}</p>
          <p><strong>ID No.:</strong> {selectedPatient.idNumber}</p>
          <p><strong>Fingerprint Data:</strong> {selectedPatient.fingerprint}</p>
          <p><strong>Medical History:</strong> {selectedPatient.medicalHistory}</p>
          <p><strong>Status:</strong> {selectedPatient.status}</p>
          <button onClick={() => setIsAccessGranted(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default PatientFiles;
