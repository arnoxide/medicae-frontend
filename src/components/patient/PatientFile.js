import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddFileModal from '../modals/AddFileModal';
import '../../styles/PatientFile.css';

const PatientFile = ({ patientId, role }) => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}/file`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFile(response.data);
      } catch (error) {
        console.error('Error fetching patient file:', error);
      }
    };

    fetchFile();
  }, [patientId]);

  const handleAddFile = (newFile) => {
    setFile(newFile);
  };

  return (
    <div className="patient-file">
      <h1>Patient File</h1>
      {file ? (
        <div>
          <h2>Basic Information</h2>
          <p>ID: {file.patientId}</p>
          <p>Name: {file.fullName}</p>
          <p>Gender: {file.gender}</p>
          <p>Date of Birth: {new Date(file.dateOfBirth).toLocaleDateString()}</p>
          <p>Address: {file.address}</p>
          <p>Phone: {file.phoneNumber}</p>
          <p>Email: {file.emailAddress}</p>
          <p>Emergency Contact: {file.emergencyContact}</p>
          {/* Add more fields as necessary */}

          {role !== 'receptionist' && (
            <>
              <h2>Medical History</h2>
              <p>Past Medical Conditions: {file.medicalHistory.pastMedicalConditions.join(', ')}</p>
              <p>Past Surgeries: {file.medicalHistory.pastSurgeries.join(', ')}</p>
              {/* Add more fields as necessary */}

              <h2>Consultation Records</h2>
              {file.consultationRecords.map((record, index) => (
                <div key={index}>
                  <p>Visit Date: {new Date(record.visitDate).toLocaleDateString()}</p>
                  <p>Symptoms: {record.symptoms}</p>
                  {/* Add more fields as necessary */}
                </div>
              ))}

              <h2>Lab Results</h2>
              {file.labResults.map((result, index) => (
                <div key={index}>
                  <p>Test: {result.testName}</p>
                  <p>Result: {result.result}</p>
                  {/* Add more fields as necessary */}
                </div>
              ))}
            </>
          )}

          <button onClick={() => setShowModal(true)}>Add to File</button>
        </div>
      ) : (
        <div className="no-file">
          <p>No file available. Click below to add.</p>
          <button onClick={() => setShowModal(true)}>Add File</button>
        </div>
      )}
      {showModal && <AddFileModal patientId={patientId} onClose={() => setShowModal(false)} onAddFile={handleAddFile} />}
    </div>
  );
};

export default PatientFile;
