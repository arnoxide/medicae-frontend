import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

const generateStaffID = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let id = '';
  for (let i = 0; i < 3; i++) {
    id += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 3; i++) {
    id += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return id;
};

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

const AddStaffModal = ({ onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    staffID: generateStaffID(),
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    password: generatePassword(),
    address: '',
    profilePicture: '',
    specialist: '',
    role: '',
    department: '',
    employmentType: '',
    startDate: '',
    endDate: '',
    workingHours: '',
    supervisor: '',
    status: 'active',
  });

  const [error, setError] = useState('');

  const copyPasswordToClipboard = (password) => {
    navigator.clipboard.writeText(password).then(() => {
      alert('Password copied to clipboard');
    }, (err) => {
      console.error('Could not copy password: ', err);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(`${config.API_BASE_URL}/staff/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onAddStaff(response.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError('Email already exists. Please use a different email.');
      } else {
        console.error('Error creating staff:', error);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh', // Limit the modal height
          overflow: 'hidden', // Hide overflow except the form scroll
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Add Staff</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div
          style={{
            overflowY: 'auto', // Enable scrolling
            maxHeight: 'calc(80vh - 60px)', // Adjust height for scrolling
            paddingRight: '10px',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Staff ID</label>
              <input
                type="text"
                name="staffID"
                value={formData.staffID}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  readOnly
                  style={{
                    flexGrow: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
                <Copy
                  size={16}
                  onClick={() => copyPasswordToClipboard(formData.password)}
                  style={{ cursor: 'pointer', marginLeft: '8px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Profile Picture</label>
              <input
                type="file"
                name="profilePicture"
                onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Specialist</label>
              <input
                type="text"
                name="specialist"
                value={formData.specialist}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Role</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Working Hours</label>
              <input
                type="text"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Supervisor</label>
              <input
                type="text"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Add Staff
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
