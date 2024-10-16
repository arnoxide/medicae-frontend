import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewFile = () => {
  const { patientId } = useParams(); // Use patientId to fetch data
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/patient-files/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatientData(response.data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Error fetching patient data');
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (error) return <div>{error}</div>;
  if (!patientData) return <div>Loading...</div>;

  const {
    idNumber,
    fullName = {},
    gender,
    dateOfBirth,
    address = {},
    phoneNumber,
    email,
    emergencyContact = {},
    medicalHistory = {},
  } = patientData;

  return (
    <div className="file-details">
      <h2>File Details for {fullName.firstName || 'N/A'} {fullName.lastName || 'N/A'}</h2>
      <p><strong>ID Number:</strong> {idNumber || 'N/A'}</p>
      <p><strong>Gender:</strong> {gender || 'N/A'}</p>
      <p><strong>Date of Birth:</strong> {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Address:</strong> {`${address.street || 'N/A'}, ${address.city || 'N/A'}, ${address.state || 'N/A'} ${address.zipCode || 'N/A'}`}</p>
      <p><strong>Phone Number:</strong> {phoneNumber || 'N/A'}</p>
      <p><strong>Email:</strong> {email || 'N/A'}</p>
      <p><strong>Emergency Contact:</strong> {`${emergencyContact.name || 'N/A'} (${emergencyContact.relation || 'N/A'}) - ${emergencyContact.phoneNumber || 'N/A'}`}</p>

      <h3>Medical History</h3>
      <p><strong>Past Medical Conditions:</strong> {medicalHistory.pastMedicalConditions?.join(', ') || 'None'}</p>
      <p><strong>Allergies:</strong> {medicalHistory.allergies?.join(', ') || 'None'}</p>
    </div>
  );
};

export default ViewFile;
