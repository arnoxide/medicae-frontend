import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AddFileModal.css';

const AddFileModal = ({ idNumber, onClose, onAddFile }) => {
  const [fileData, setFileData] = useState({
    idNumber: '',
    fullName: {
      firstName: '',
      lastName: ''
    },
    gender: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phoneNumber: '',
    emailAddress: '',
    emergencyContact: {
      name: '',
      relation: '',
      phoneNumber: ''
    },
    medicalHistory: {
      pastMedicalConditions: [],
      pastSurgeries: [],
      chronicIllnesses: [],
      allergies: [],
      medications: [],
      vaccinationHistory: []
    },
    familyHistory: {
      geneticDiseases: [],
      familyMedicalConditions: []
    },
    consultationRecords: [],
    labResults: [],
    vitalSigns: {},
    insuranceAndBilling: {},
    additionalInformation: {},
    appointmentHistory: {
      upcomingAppointments: [],
      pastAppointments: []
    }
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/idNumber/${idNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const patient = response.data;
        console.log('Fetched patient data:', patient);
        if (patient) {
          setFileData((prevData) => ({
            ...prevData,
            idNumber: patient.idNumber || '',
            fullName: {
              firstName: patient.firstName || '',
              lastName: patient.lastName || ''
            },
            gender: patient.gender || '',
            dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
            address: {
              street: patient.address.street || '',
              city: patient.address.city || '',
              state: patient.address.state || '',
              zipCode: patient.address.zipCode || ''
            },
            phoneNumber: patient.phoneNumber || '',
            emailAddress: patient.email || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };
  
    fetchPatientData();
  }, [idNumber]);  

  const handleNestedChange = (e, section, nestedField) => {
    const { value } = e.target;
    setFileData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [nestedField]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`http://localhost:5000/api/patient-files`, fileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onAddFile(response.data);
      alert('File added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding file:', error);
      alert('Failed to add file. Please try again.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{fileData.idNumber ? 'Edit File' : 'Add File'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID Number</label>
            <input type="text" value={fileData.idNumber} readOnly />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={fileData.fullName.firstName} readOnly />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={fileData.fullName.lastName} readOnly />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input type="text" name="gender" value={fileData.gender} readOnly />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={fileData.dateOfBirth} readOnly />
          </div>
          <div className="form-group">
            <label>Street</label>
            <input type="text" name="street" value={fileData.address.street} readOnly />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={fileData.address.city} readOnly />
          </div>
          <div className="form-group">
            <label>State</label>
            <input type="text" name="state" value={fileData.address.state} readOnly />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input type="text" name="zipCode" value={fileData.address.zipCode} readOnly />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phoneNumber" value={fileData.phoneNumber} readOnly />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="emailAddress" value={fileData.emailAddress} readOnly />
          </div>
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input
              type="text"
              name="name"
              value={fileData.emergencyContact.name}
              onChange={(e) => handleNestedChange(e, 'emergencyContact', 'name')}
              required
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Relation</label>
            <input
              type="text"
              name="relation"
              value={fileData.emergencyContact.relation}
              onChange={(e) => handleNestedChange(e, 'emergencyContact', 'relation')}
              required
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={fileData.emergencyContact.phoneNumber}
              onChange={(e) => handleNestedChange(e, 'emergencyContact', 'phoneNumber')}
              required
            />
          </div>
          <button type="submit">{fileData.idNumber ? 'Update File' : 'Add File'}</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddFileModal;
