import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AddFileModal.css'; // Ensure you have the styles in place or adjust as needed

const AddFileModal = ({ patient, onClose, onAddFile }) => {
  // Initialize the form data with patient details
  const [fileData, setFileData] = useState({
    idNumber: patient.idNumber,
    fullName: {
      firstName: patient.firstName,
      lastName: patient.lastName,
    },
    gender: patient.gender,
    dateOfBirth: patient.dateOfBirth.split('T')[0],
    address: {
      street: patient.address.street,
      city: patient.address.city,
      state: patient.address.state,
      zipCode: patient.address.zipCode,
    },
    phoneNumber: patient.phoneNumber,
    emailAddress: patient.email,
    emergencyContact: {
      name: '',
      relation: '',
      phoneNumber: '',
    },
    medicalHistory: {
      pastMedicalConditions: [],
      pastSurgeries: [],
      chronicIllnesses: [],
      allergies: [],
      medications: [],
      vaccinationHistory: [],
    },
    familyHistory: {
      geneticDiseases: [],
      familyMedicalConditions: [],
    },
    consultationRecords: [],
    labResults: [],
    vitalSigns: {},
    insuranceAndBilling: {},
    additionalInformation: {},
    appointmentHistory: {
      upcomingAppointments: [],
      pastAppointments: [],
    },
  });

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
    console.log('Submitting file data:', fileData);
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
      console.error('Error adding file:', error.response ? error.response.data : error.message);
      alert('Failed to add file. Please try again.');
    }
  };  

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add File</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID Number</label>
            <input type="text" value={fileData.idNumber} readOnly />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" value={fileData.fullName.firstName} readOnly />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" value={fileData.fullName.lastName} readOnly />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input type="text" value={fileData.gender} readOnly />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" value={fileData.dateOfBirth} readOnly />
          </div>
          <div className="form-group">
            <label>Street</label>
            <input type="text" value={fileData.address.street} readOnly />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" value={fileData.address.city} readOnly />
          </div>
          <div className="form-group">
            <label>State</label>
            <input type="text" value={fileData.address.state} readOnly />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input type="text" value={fileData.address.zipCode} readOnly />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" value={fileData.phoneNumber} readOnly />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={fileData.emailAddress} readOnly />
          </div>
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input
              type="text"
              value={fileData.emergencyContact.name}
              onChange={(e) => handleNestedChange(e, 'emergencyContact', 'name')}
              required
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Relation</label>
            <input
              type="text"
              value={fileData.emergencyContact.relation}
              onChange={(e) => handleNestedChange(e, 'emergencyContact', 'relation')}
              required
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Phone Number</label>
            <input
              type="text"
              value={fileData.emergencyContact.phoneNumber}
              onChange={(e) => handleNestedChange(e, 'emergencyContact', 'phoneNumber')}
              required
            />
          </div>
          {/* Add additional form fields as necessary for the file data */}
          <button type="submit">Add File</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddFileModal;
