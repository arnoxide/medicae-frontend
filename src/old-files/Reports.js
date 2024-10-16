import React, { useState } from 'react';
import '../styles/Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('delivery');
  const [reportData, setReportData] = useState(null);

  const generateReport = () => {
    // Replace this with actual data fetching logic
    switch (reportType) {
      case 'delivery':
        setReportData([
          { id: 1, patientName: 'John Doe', medicine: 'Ibuprofen', status: 'Delivered', date: '2024-08-30' },
          { id: 2, patientName: 'Jane Smith', medicine: 'Paracetamol', status: 'Scheduled', date: '2024-09-01' },
          // Add more sample data as needed
        ]);
        break;
      case 'inventory':
        setReportData([
          { id: 1, medicine: 'Ibuprofen', quantity: 100, expiryDate: '2025-08-01', location: 'Warehouse A' },
          { id: 2, medicine: 'Paracetamol', quantity: 200, expiryDate: '2024-11-15', location: 'Warehouse B' },
          // Add more sample data as needed
        ]);
        break;
      default:
        setReportData([]);
        break;
    }
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>Generate Reports</h1>
      </div>
      <div className="reports-form">
        <div className="form-group">
          <label>Report Type</label>
          <select
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="delivery">Delivery Report</option>
            <option value="inventory">Inventory Report</option>
            {/* Add more report types as needed */}
          </select>
        </div>
        <button onClick={generateReport}>Generate Report</button>
      </div>
      <div className="reports-content">
        {reportData ? (
          <table>
            <thead>
              <tr>
                {Object.keys(reportData[0]).map(key => (
                  <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((data, index) => (
                <tr key={index}>
                  {Object.values(data).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No report generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
