import React, { useState } from 'react';
import '../styles/Treatments.css';

const Treatments = () => {
  const [treatments, setTreatments] = useState([
    { id: 1, name: 'Scaling Teeth', duration: '30 mins', cost: '$50' },
    { id: 2, name: 'Tooth Extraction', duration: '45 mins', cost: '$100' },
    // Add more sample data as needed
  ]);

  const [form, setForm] = useState({
    name: '',
    duration: '',
    cost: ''
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
    setTreatments([...treatments, { ...form, id: treatments.length + 1 }]);
    setForm({
      name: '',
      duration: '',
      cost: ''
    });
  };

  return (
    <div className="treatments">
      <div className="treatments-header">
        <h1>Treatments</h1>
      </div>
      <div className="treatments-form">
        <h3>Add New Treatment</h3>
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
            <label>Duration</label>
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Cost</label>
            <input
              type="text"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Add Treatment</button>
        </form>
      </div>
      <div className="treatments-list">
        <h3>Existing Treatments</h3>
        {treatments.length === 0 ? (
          <p>No treatments available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((treatment) => (
                <tr key={treatment.id}>
                  <td>{treatment.name}</td>
                  <td>{treatment.duration}</td>
                  <td>{treatment.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Treatments;
