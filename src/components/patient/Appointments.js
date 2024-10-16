import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    idNumber: '',
    date: '',
    time: '',
    doctor: '',
    reason: ''
  });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchDoctors = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/staff/doctors', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/appointments', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Appointment created successfully!');
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  return (
    <div className="appointment-page">
      <h1>Appointments</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="idNumber" placeholder="Patient ID Number" value={formData.idNumber} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        <select>
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                {doctor.fullName}
                </option>
            ))}
            </select>
        <input type="text" name="reason" placeholder="Reason" value={formData.reason} onChange={handleChange} required />
        <button type="submit">Add Appointment</button>
      </form>

      <ul>
        {appointments.map(({ _id, patientId, date, time, doctor, reason }) => (
          <li key={_id}>
            {patientId} - {new Date(date).toLocaleDateString()} at {time} with Dr. {doctor} for {reason}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Appointments;
