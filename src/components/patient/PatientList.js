import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientList = ({ patients, onViewFile, onAddFile }) => {
  const [patientFiles, setPatientFiles] = useState({});

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
          {patients.map(({ _id, firstName, lastName, dateOfBirth, address, phoneNumber, email, idNumber }) => (
            <tr key={_id}>
              <td>{firstName}</td>
              <td>{lastName}</td>
              <td>{new Date(dateOfBirth).toLocaleDateString()}</td>
              <td>
                {address ? (
                  <>
                    {address.street}, {address.city}, {address.state} {address.zipCode}
                  </>
                ) : 'N/A'}
              </td>
              <td>{phoneNumber}</td>
              <td>{email}</td>
              <td>
                {patientFiles[idNumber] ? (
                  <button onClick={() => onAddFile(idNumber)}>View File</button> //Updated to Modal for now
                ) : (
                  <button onClick={() => onAddFile(idNumber)}>Add File</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
