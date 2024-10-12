import React, { useState, useEffect } from 'react';
import '../../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([
    // Sample data
    { id: 1, name: 'John Doe', age: 30, condition: 'Flu', gender: 'Male' },
    { id: 2, name: 'Jane Smith', age: 25, condition: 'Cough', gender: 'Female' },
    { id: 3, name: 'Jane Smith', age: 25, condition: 'Cough', gender: 'Female' },
    { id: 4, name: 'Jane Smith', age: 25, condition: 'Cough', gender: 'male' },
 
    // Add more sample data as needed
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || patient.gender === filter;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="patients">
      <div className="patients-header">
        <h1>Patients</h1>
      </div>
      <div className="patients-controls">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <div className="patients-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Condition</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.length === 0 ? (
              <tr>
                <td colSpan="4">No patients found.</td>
              </tr>
            ) : (
              currentPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.condition}</td>
                  <td>{patient.gender}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="patients-pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Patients;
