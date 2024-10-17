import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from '../../config';
import '../../styles/ViewFile.css';

const ViewFile = ({ role }) => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${config.API_BASE_URL}/patient-files/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatientData(response.data);
        setFormData(response.data); // Initialize form data with fetched data
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Error fetching patient data');
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
      setFormData((prevData) => ({
        ...prevData,
        [keys[0]]: {
          ...prevData[keys[0]],
          [keys[1]]: value.split(',').map(item => item.trim()),
        },
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${config.API_BASE_URL}/patient-files/${patientId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Patient data updated successfully!');
      setIsEditing(false);
      setPatientData(formData); // Update displayed data
    } catch (error) {
      console.error('Error updating patient data:', error);
      alert('Failed to update patient data. Please try again.');
    }
  };

  if (error) return <div>{error}</div>;
  if (!patientData) return <div>Loading...</div>;

  return (
    <div className="file-details">
      <h2>File Details for {formData.fullName?.firstName || 'N/A'} {formData.fullName?.lastName || 'N/A'}</h2>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <label>
            Past Medical Conditions:
            <input
              type="text"
              name="medicalHistory.pastMedicalConditions"
              value={formData.medicalHistory?.pastMedicalConditions?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Past Surgeries:
            <input
              type="text"
              name="medicalHistory.pastSurgeries"
              value={formData.medicalHistory?.pastSurgeries?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Chronic Illnesses:
            <input
              type="text"
              name="medicalHistory.chronicIllnesses"
              value={formData.medicalHistory?.chronicIllnesses?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Allergies:
            <input
              type="text"
              name="medicalHistory.allergies"
              value={formData.medicalHistory?.allergies?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Medications:
            <input
              type="text"
              name="medicalHistory.medications"
              value={formData.medicalHistory?.medications?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Vaccination History:
            <input
              type="text"
              name="medicalHistory.vaccinationHistory"
              value={formData.medicalHistory?.vaccinationHistory?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Genetic Diseases:
            <input
              type="text"
              name="familyHistory.geneticDiseases"
              value={formData.familyHistory?.geneticDiseases?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Family Medical Conditions:
            <input
              type="text"
              name="familyHistory.familyMedicalConditions"
              value={formData.familyHistory?.familyMedicalConditions?.join(', ') || ''}
              onChange={handleChange}
            />
          </label>
          {/* Add more fields as needed */}
          <button type="submit">Save</button>
        </form>
      ) : (
        <>
          <p><strong>ID Number:</strong> {patientData.idNumber || 'N/A'}</p>
          <p><strong>Gender:</strong> {patientData.gender || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Address:</strong> {`${patientData.address?.street || 'N/A'}, ${patientData.address?.city || 'N/A'}, ${patientData.address?.state || 'N/A'} ${patientData.address?.zipCode || 'N/A'}`}</p>
          <p><strong>Phone Number:</strong> {patientData.phoneNumber || 'N/A'}</p>
          <p><strong>Email:</strong> {patientData.email || 'N/A'}</p>
          <p><strong>Emergency Contact:</strong> {`${patientData.emergencyContact?.name || 'N/A'} (${patientData.emergencyContact?.relation || 'N/A'}) - ${patientData.emergencyContact?.phoneNumber || 'N/A'}`}</p>

          <h3>Medical History</h3>
          <p><strong>Past Medical Conditions:</strong> {patientData.medicalHistory?.pastMedicalConditions?.join(', ') || 'None'}</p>
          <p><strong>Past Surgeries:</strong> {patientData.medicalHistory?.pastSurgeries?.join(', ') || 'None'}</p>
          <p><strong>Chronic Illnesses:</strong> {patientData.medicalHistory?.chronicIllnesses?.join(', ') || 'None'}</p>
          <p><strong>Allergies:</strong> {patientData.medicalHistory?.allergies?.join(', ') || 'None'}</p>
          <p><strong>Medications:</strong> {patientData.medicalHistory?.medications?.join(', ') || 'None'}</p>
          <p><strong>Vaccination History:</strong> {patientData.medicalHistory?.vaccinationHistory?.join(', ') || 'None'}</p>
          <p><strong>Genetic Diseases:</strong> {patientData.familyHistory?.geneticDiseases?.join(', ') || 'None'}</p>
          <p><strong>Family Medical Conditions:</strong> {patientData.familyHistory?.familyMedicalConditions?.join(', ') || 'None'}</p>
        </>
      )}

      {(role === 'doctor' || role === 'nurse' || role === 'admin') && (
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      )}
    </div>
  );
};

export default ViewFile;
