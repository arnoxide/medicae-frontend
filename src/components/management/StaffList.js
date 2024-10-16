import React, { useState } from 'react';
import '../../styles/StaffList.css';

const StaffList = () => {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Alice Johnson', position: 'Dentist', contact: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', position: 'Hygienist', contact: 'bob@example.com' },
    // Add more sample data as needed
  ]);

  const [form, setForm] = useState({
    name: '',
    position: '',
    contact: ''
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
    setStaff([...staff, { ...form, id: staff.length + 1 }]);
    setForm({
      name: '',
      position: '',
      contact: ''
    });
  };

  return (
    <div className="staff-list">
      <div className="staff-list-header">
        <h1>Staff List</h1>
      </div>
      <div className="staff-list-form">
        <h3>Add New Staff Member</h3>
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
            <label>Position</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Add Staff Member</button>
        </form>
      </div>
      <div className="staff-list-table">
        <h3>Existing Staff Members</h3>
        {staff.length === 0 ? (
          <p>No staff members available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td>{staffMember.name}</td>
                  <td>{staffMember.position}</td>
                  <td>{staffMember.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffList;
