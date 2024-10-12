import React, { useState } from 'react';
import '../styles/Reservations.css';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setReservations([...reservations, form]);
    setForm({
      name: '',
      date: '',
      time: '',
      notes: ''
    });
  };

  return (
    <div className="reservations">
      <div className="reservations-header">
        <h1>Appointment</h1>
      </div>
      <div className="reservations-form">
        <h3>Add New Appointment</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
            ></textarea>
          </div>
          <button type="submit">Add Reservation</button>
        </form>
      </div>
      <div className="reservations-list">
        <h3>Existing Appointment</h3>
        {reservations.length === 0 ? (
          <p>No Appointment yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation, index) => (
                <tr key={index}>
                  <td>{reservation.name}</td>
                  <td>{reservation.date}</td>
                  <td>{reservation.time}</td>
                  <td>{reservation.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reservations;
