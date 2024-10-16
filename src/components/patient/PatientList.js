import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddFileModal from '../modals/AddFileModal';
import config from '../../config';

const PatientList = ({ patients }) => {
  const [patientFiles, setPatientFiles] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientFiles = async () => {
      const token = localStorage.getItem('token');
      try {
        const fileStatuses = await Promise.all(
          patients.map(async (patient) => {
            try {
              const response = await axios.get(`${config.API_BASE_URL}/patient-files/${patient.idNumber}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return { [patient.idNumber]: !!response.data };
            } catch (error) {
              if (error.response && error.response.status === 404) {
                return { [patient.idNumber]: false };
              }
              console.error('Error checking patient file:', error);
              return { [patient.idNumber]: false };
            }
          })
        );

        const files = fileStatuses.reduce((acc, fileStatus) => {
          return { ...acc, ...fileStatus };
        }, {});

        console.log('Fetched patient files:', files);
        setPatientFiles(files);
      } catch (error) {
        console.error('Error fetching patient files:', error);
      }
    };

    fetchPatientFiles();
  }, [patients]);

  const handleAddFile = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPatient(null);
  };

  const handleViewFile = (idNumber) => {
    navigate(`/patient-files/${idNumber}`);
  };

  const handleAddFileSuccess = (idNumber) => {
    setPatientFiles((prevFiles) => ({
      ...prevFiles,
      [idNumber]: true,
    }));
  };

  return (
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
              <td>
                {patient.address ? (
                  <>
                    {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                  </>
                ) : 'N/A'}
              </td>
              <td>{patient.phoneNumber}</td>
              <td>{patient.email}</td>
              <td>
                {patientFiles[patient.idNumber] ? (
                  <button onClick={() => handleViewFile(patient.idNumber)}>View File</button>
                ) : (
                  <button onClick={() => handleAddFile(patient)}>Add File</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedPatient && (
        <AddFileModal
          patient={selectedPatient}
          onClose={handleCloseModal}
          onAddFile={(newFileData) => {
            handleAddFileSuccess(selectedPatient.idNumber);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default PatientList;
