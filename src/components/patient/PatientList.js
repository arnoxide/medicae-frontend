import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddFileModal from '../modals/AddFileModal'; // Import your modal component

const PatientList = ({ patients, onViewFile }) => {
  const [patientFiles, setPatientFiles] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null); // State to manage selected patient
  const [isModalOpen, setModalOpen] = useState(false); // State to manage modal visibility

  useEffect(() => {
    const fetchPatientFiles = async () => {
      const token = localStorage.getItem('token');
      try {
        const fileStatuses = await Promise.all(
          patients.map(async (patient) => {
            try {
              const response = await axios.get(`http://localhost:5000/api/patient-files/${patient.idNumber}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return { [patient.idNumber]: response.data ? true : false }; // File exists
            } catch (error) {
              if (error.response && error.response.status === 404) {
                return { [patient.idNumber]: false }; // File does not exist
              }
              console.error('Error checking patient file:', error);
              return { [patient.idNumber]: false }; // Default to no file on error
            }
          })
        );

        const files = fileStatuses.reduce((acc, fileStatus) => {
          return { ...acc, ...fileStatus };
        }, {});

        setPatientFiles(files);
      } catch (error) {
        console.error('Error fetching patient files:', error);
      }
    };

    fetchPatientFiles();
  }, [patients]);

  const handleAddFile = (patient) => {
    setSelectedPatient(patient); // Set the selected patient for the modal
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
    setSelectedPatient(null); // Clear the selected patient
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
                  <button onClick={() => onViewFile(patient.idNumber)}>View File</button>
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
          patient={selectedPatient} // Pass the entire patient object to the modal
          onClose={handleCloseModal}
          onAddFile={(newFileData) => {
            setPatientFiles((prevFiles) => ({
              ...prevFiles,
              [selectedPatient.idNumber]: true,
            }));
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default PatientList;
