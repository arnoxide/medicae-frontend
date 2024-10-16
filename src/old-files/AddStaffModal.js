import React, { useState, useRef } from 'react';
import { X, Copy } from 'lucide-react';
import axios from 'axios';
import '../styles/AddStaffModal.css';

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
      const response = await axios.post('http://localhost:5000/api/staff/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onAddStaff(response.data); // Use response data
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Staff</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Staff ID</label>
            <input type="text" name="staffID" value={formData.staffID} readOnly />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          </div>
          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-container">
              <input type="text" name="password" value={formData.password} readOnly />
              <Copy size={16} className="copy-icon" onClick={() => copyPasswordToClipboard(formData.password)} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Profile Picture</label>
            <input type="file" name="profilePicture" onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })} />
          </div>
          <div className="form-group">
            <label>Specialist</label>
            <input type="text" name="specialist" value={formData.specialist} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Admin">Admin</option>
              {/* Add other roles as needed */}
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Employment Type</label>
            <select name="employmentType" value={formData.employmentType} onChange={handleChange} required>
              <option value="">Select Employment Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="form-group">
            <label>Employee Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Employee End Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Working Hours/Shift</label>
            <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Supervisor</label>
            <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="leave">Leave</option>
              <option value="sick">Sick</option>
              <option value="away">Away</option>
              <option value="vacation">Vacation</option>
              {/* Add other statuses as needed */}
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Add Staff</button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
