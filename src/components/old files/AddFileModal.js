import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AddFileModal.css';

const AddFileModal = ({ patientId, role, onClose, onAddFile }) => {
  const [fileData, setFileData] = useState({
    fullName: {
      firstName: '',
      lastName: ''
    },
    gender: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    emailAddress: '',
    emergencyContact: {
      name: '',
      relation: '',
      phoneNumber: ''
    },
    medicalHistory: {
      pastMedicalConditions: '',
      pastSurgeries: '',
      chronicIllnesses: '',
      allergies: '',
      medications: '',
      vaccinationHistory: ''
    },
    familyHistory: {
      geneticDiseases: '',
      familyMedicalConditions: ''
    },
    consultationRecords: [],
    labResults: [],
    vitalSigns: {},
    insuranceAndBilling: {},
    additionalInformation: {},
    appointmentHistory: {
      upcomingAppointments: '',
      pastAppointments: ''
    }
  });

  useEffect(() => {
    // Fetch patient data when the component mounts
    const fetchPatientData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const patient = response.data;

        // Ensure patient object and its properties are defined before accessing them
        if (patient) {
          setFileData({
            fullName: {
              firstName: patient.firstName || '',
              lastName: patient.lastName || ''
            },
            gender: patient.gender || '',
            dateOfBirth: patient.dateOfBirth || '',
            address: patient.address || '',
            phoneNumber: patient.phoneNumber || '',
            emailAddress: patient.email || '',
            emergencyContact: {
              name: (patient.emergencyContact && patient.emergencyContact.name) || '',
              relation: (patient.emergencyContact && patient.emergencyContact.relation) || '',
              phoneNumber: (patient.emergencyContact && patient.emergencyContact.phoneNumber) || ''
            },
            medicalHistory: {
              pastMedicalConditions: '',
              pastSurgeries: '',
              chronicIllnesses: '',
              allergies: '',
              medications: '',
              vaccinationHistory: ''
            },
            familyHistory: {
              geneticDiseases: '',
              familyMedicalConditions: ''
            },
            consultationRecords: [],
            labResults: [],
            vitalSigns: {},
            insuranceAndBilling: {},
            additionalInformation: {},
            appointmentHistory: {
              upcomingAppointments: '',
              pastAppointments: ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFileData({
      ...fileData,
      [name]: value,
    });
  };

  const handleNestedChange = (e, section, nestedField) => {
    const {value } = e.target;
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
      onClose();
    } catch (error) {
      console.error('Error adding file:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add File</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={fileData.fullName.firstName} onChange={(e) => handleNestedChange(e, 'fullName', 'firstName')} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={fileData.fullName.lastName} onChange={(e) => handleNestedChange(e, 'fullName', 'lastName')} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input type="text" name="gender" value={fileData.gender} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={fileData.dateOfBirth} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={fileData.address} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phoneNumber" value={fileData.phoneNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="emailAddress" value={fileData.emailAddress} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input type="text" name="emergencyContactName" value={fileData.emergencyContact.name} onChange={(e) => handleNestedChange(e, 'emergencyContact', 'name')} />
          </div>
          <div className="form-group">
            <label>Emergency Contact Relation</label>
            <input type="text" name="emergencyContactRelation" value={fileData.emergencyContact.relation} onChange={(e) => handleNestedChange(e, 'emergencyContact', 'relation')} />
          </div>
          <div className="form-group">
            <label>Emergency Contact Phone Number</label>
            <input type="text" name="emergencyContactPhoneNumber" value={fileData.emergencyContact.phoneNumber} onChange={(e) => handleNestedChange(e, 'emergencyContact', 'phoneNumber')} />
          </div>

          {(role === 'doctor' || role === 'nurse' || role === 'admin' || role === 'patient') && (
            <>
              <div className="form-group">
                <label>Past Medical Conditions</label>
                <input type="text" name="pastMedicalConditions" value={fileData.medicalHistory.pastMedicalConditions} onChange={(e) => handleNestedChange(e, 'medicalHistory', 'pastMedicalConditions')} />
              </div>
              <div className="form-group">
                <label>Past Surgeries</label>
                <input type="text" name="pastSurgeries" value={fileData.medicalHistory.pastSurgeries} onChange={(e) => handleNestedChange(e, 'medicalHistory', 'pastSurgeries')} />
              </div>
              <div className="form-group">
                <label>Chronic Illnesses</label>
                <input type="text" name="chronicIllnesses" value={fileData.medicalHistory.chronicIllnesses} onChange={(e) => handleNestedChange(e, 'medicalHistory', 'chronicIllnesses')} />
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <input type="text" name="allergies" value={fileData.medicalHistory.allergies} onChange={(e) => handleNestedChange(e, 'medicalHistory', 'allergies')} />
              </div>
              <div className="form-group">
                <label>Medications</label>
                <input type="text" name="medications" value={fileData.medicalHistory.medications} onChange={(e) => handleNestedChange(e, 'medicalHistory', 'medications')} />
              </div>
              <div className="form-group">
                <label>Vaccination History</label>
                <input type="text" name="vaccinationHistory" value={fileData.medicalHistory.vaccinationHistory} onChange={(e) => handleNestedChange(e, 'medicalHistory', 'vaccinationHistory')} />
              </div>
              <div className="form-group">
                <label>Genetic Diseases</label>
                <input type="text" name="geneticDiseases" value={fileData.familyHistory.geneticDiseases} onChange={(e) => handleNestedChange(e, 'familyHistory', 'geneticDiseases')} />
              </div>
              <div className="form-group">
                <label>Family Medical Conditions</label>
                <input type="text" name="familyMedicalConditions" value={fileData.familyHistory.familyMedicalConditions} onChange={(e) => handleNestedChange(e, 'familyHistory', 'familyMedicalConditions')} />
              </div>
              {/* Add more fields as necessary for doctors */}
            </>
          )}

          <button type="submit">Add File</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddFileModal;
