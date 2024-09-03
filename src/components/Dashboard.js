import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Dashboard.css';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const lineData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    datasets: [
      {
        label: 'Death tools',
        data: [2000, 4000, 3000, 5000, 7000, 10000, 8000, 9000, 11000, 12000, 13000, 14000],
        borderColor: '#4c84ff',
        backgroundColor: 'rgba(76, 132, 255, 0.1)',
        fill: true,
      },
    ],
  };

  const barData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
    datasets: [
      {
        label: 'HIV',
        data: [5000, 10000, 7000, 8000, 9000, 11000],
        backgroundColor: '#4caf50',
      },
      {
        label: 'TB',
        data: [2000, 3000, 4000, 5000, 6000, 7000],
        backgroundColor: '#ff9800',
      },
    ],
  };

  const doughnutData = {
    labels: ['files', 'queus', 'Medical Equipment', 'Supplies', 'Promotion Costs', 'Other'],
    datasets: [
      {
        data: [30, 22, 20, 18, 8, 2],
        backgroundColor: ['#4c84ff', '#ff9800', '#4caf50', '#f44336', '#9c27b0', '#00bcd4'],
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Good evening, Nduvho!</h1>
        <p>Wednesday, December 6, 2022</p>
      </div>
      <div className="dashboard-content">
        <div className="card large-card">
          <h3>Death tolls</h3>
          <div className="chart-container">
            <Line data={lineData} />
          </div>
        </div>
        <div className="card">
          <h3>Diseases ratings</h3>
          <div className="chart-container">
            <Bar data={barData} />
          </div>
        </div>
        <div className="card">
          <h3>Expenses</h3>
          <div className="chart-container">
            <Doughnut data={doughnutData} />
          </div>
        </div>
        <div className="card">
          <h3>Patients</h3>
          <div className="patients-info">
            <div>
              <p>21</p>
              <span>New patients</span>
            </div>
            <div>
              <p>142</p>
              <span>Returning patients</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Popular Treatment</h3>
          <ul className="dashboard-list">
            <li>Scaling Teeth <span>4.7</span></li>
            <li>Tooth Extraction <span>4.4</span></li>
            <li>General Checkup <span>4.6</span></li>
          </ul>
        </div>
        <div className="card">
          <h3>Stock Availability</h3>
          <div className="stock-info">
            <p>Total Asset: <strong>$53,000</strong></p>
            <p>Total Product: <strong>442</strong></p>
          </div>
          <div className="stock-status">
            <div className="status available"></div> Available
            <div className="status low"></div> Low Stock
            <div className="status out"></div> Out of Stock
          </div>
          <div className="low-stock">
            <p>Dental Brush <span>Qty: 3</span> <a href="#">Order</a></p>
            <p>Charmflex Regular <span>Qty: 2</span> <a href="#">Order</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
