import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const PatientFileList = ({ patients }) => {
  const [patientFiles, setPatientFiles] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientFiles = async () => {
      const token = localStorage.getItem('token');
      try {
        const fileStatuses = await Promise.all(
          patients.map(async (patient) => {
            try {
              const response = await axios.get(`${config.API_BASE_URL}/patient-files/${patient.idNumber}`, 
              { headers: { Authorization: `Bearer ${token}` } });

              return { [patient.idNumber]: !!response.data };
            } catch (error) {
              return { [patient.idNumber]: false };
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

  const handleViewFile = (idNumber) => {
    navigate(`/patient-files/${idNumber}`);
  };

  return (
    <div className="card patient-file-list">
      <div className="card-header">
        <h3>Patients with Files</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Birth</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.filter(patient => patientFiles[patient.idNumber]).map((patient) => (
            <tr key={patient._id}>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleViewFile(patient.idNumber)}>View File</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientFileList;
