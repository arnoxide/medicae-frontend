import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/AddPatientModal.css';

const AddPatientModal = ({ onClose, onAddPatient }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [isSouthAfrican, setIsSouthAfrican] = useState(true);
  const [idNumber, setIdNumber] = useState('');

  const handleIdNumberChange = (value) => {
    const cleanedValue = value.replace(/\D/g, ''); // Ensure only digits
    setIdNumber(cleanedValue);

    if (isSouthAfrican && cleanedValue.length === 13) {
      // Parse date of birth from ID number
      const yearPrefix = cleanedValue[0] === '0' ? '20' : '19';
      const year = yearPrefix + cleanedValue.substring(0, 2);
      const month = cleanedValue.substring(2, 4);
      const day = cleanedValue.substring(4, 6);
      setDateOfBirth(`${year}-${month}-${day}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/patients', {
        firstName,
        lastName,
        dateOfBirth,
        address: { street, city, state, zipCode },
        phoneNumber,
        email,
        gender,
        idNumber,
        hasFile: 0
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onAddPatient(response.data);
      onClose();
      alert('Patient added successfully!');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. The ID number or passport might already exist.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Add Patient</h2>
        <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>South African Citizen?</label>
            <select
              value={isSouthAfrican}
              onChange={(e) => setIsSouthAfrican(e.target.value === 'true')}
              required
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>{isSouthAfrican ? 'ID Number' : 'Passport Number'}</label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => handleIdNumberChange(e.target.value)}
              maxLength={isSouthAfrican ? 13 : 9}
              required
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              readOnly={isSouthAfrican}
            />
          </div>
          <div className="form-group">
            <label>Street</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
       
          <button type="submit">Add Patient</button>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
