import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import config from '../config'; // Import the config file

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffID, setStaffID] = useState('');
  const [role, setRole] = useState('admin'); // Default to admin
  const [error, setError] = useState('');
  const navigate = useNavigate(); // useNavigate to programmatically navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear error message before submitting

    const loginData = role === 'admin' ? { username, password } : { staffID, password };

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...loginData, role }), // Pass both login data and role
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        onLogin(data.role); // Pass the role to the onLogin callback

        // Redirect based on role
        navigate(`/${data.role.toLowerCase()}`);
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="staff">Staff (Doctor, Nurse, Receptionist)</option>
          </select>
        </div>

        {role === 'admin' ? (
          <>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Staff ID</label>
              <input
                type="text"
                value={staffID}
                onChange={(e) => setStaffID(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
