import React, { useState } from 'react';
import '../styles/Accounts.css';

const Accounts = () => {
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Administrator' },
    { id: 2, name: 'User', email: 'user@example.com', role: 'User' },
    // Add more sample data as needed
  ]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: ''
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
    setAccounts([...accounts, { ...form, id: accounts.length + 1 }]);
    setForm({
      name: '',
      email: '',
      role: ''
    });
  };

  return (
    <div className="accounts">
      <div className="accounts-header">
        <h1>Accounts</h1>
      </div>
      <div className="accounts-form">
        <h3>Add New Account</h3>
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
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Add Account</button>
        </form>
      </div>
      <div className="accounts-list">
        <h3>Existing Accounts</h3>
        {accounts.length === 0 ? (
          <p>No accounts available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.email}</td>
                  <td>{account.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Accounts;
