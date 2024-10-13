// ViewFile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewFile = ({ patientId }) => {
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/patient-files/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFileData(response.data);
      } catch (error) {
        console.error('Error fetching patient file:', error);
      }
    };

    fetchFile();
  }, [patientId]);

  if (!fileData) return <div>Loading...</div>;

  return (
    <div className="file-details">
      <h2>File Details for {fileData.fullName.firstName} {fileData.fullName.lastName}</h2>
      {/* Display file data */}
    </div>
  );
};

export default ViewFile;