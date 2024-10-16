import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Modal from 'react-modal';
import '../styles/Stocks.css';

Modal.setAppElement('#root');

const Stocks = () => {
  const [stocks, setStocks] = useState([
    { id: 1, medicine: 'Ibuprofen', quantity: 100, expiryDate: '2025-08-01', location: 'Warehouse A' },
    { id: 2, medicine: 'Paracetamol', quantity: 200, expiryDate: '2024-11-15', location: 'Warehouse B' },
    // Add more sample data as needed
  ]);

  const [form, setForm] = useState({
    id: null,
    medicine: '',
    quantity: '',
    expiryDate: '',
    location: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    minQuantity: '',
    maxQuantity: '',
    startDate: '',
    endDate: ''
  });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id === null) {
      setStocks([...stocks, { ...form, id: stocks.length + 1, quantity: parseInt(form.quantity) }]);
    } else {
      setStocks(stocks.map(stock => stock.id === form.id ? form : stock));
    }
    setForm({
      id: null,
      medicine: '',
      quantity: '',
      expiryDate: '',
      location: ''
    });
    setIsModalOpen(false);
  };

  const handleEdit = (stock) => {
    setForm(stock);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setForm({
      id: null,
      medicine: '',
      quantity: '',
      expiryDate: '',
      location: ''
    });
    setIsModalOpen(true);
  };

  const applyFilters = (stocks) => {
    return stocks.filter((stock) => {
      const meetsSearchCriteria = stock.medicine.toLowerCase().includes(search.toLowerCase());
      const meetsQuantityCriteria =
        (!filter.minQuantity || stock.quantity >= parseInt(filter.minQuantity)) &&
        (!filter.maxQuantity || stock.quantity <= parseInt(filter.maxQuantity));
      const meetsDateCriteria =
        (!filter.startDate || new Date(stock.expiryDate) >= new Date(filter.startDate)) &&
        (!filter.endDate || new Date(stock.expiryDate) <= new Date(filter.endDate));

      return meetsSearchCriteria && meetsQuantityCriteria && meetsDateCriteria;
    });
  };

  const filteredStocks = applyFilters(stocks);

  useEffect(() => {
    // Optionally, you can fetch stock data from an API here
  }, []);

  const chartData = {
    labels: filteredStocks.map(stock => stock.medicine),
    datasets: [
      {
        label: 'Quantity',
        data: filteredStocks.map(stock => stock.quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }
    ]
  };

  return (
    <div className="stocks">
      <div className="stocks-header">
        <h1>Medicine Stocks Inventory</h1>
        <button className="add-new-button" onClick={handleAddNew}>Add New Medicine</button>
      </div>
      <div className="collapsible-panel">
        <div className="collapsible-header" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
          <h3>{isPanelCollapsed ? 'Show Filters' : 'Hide Filters'}</h3>
          <div className={`arrow ${isPanelCollapsed ? 'down' : 'up'}`}></div>
        </div>
        {!isPanelCollapsed && (
          <div className="stocks-filters">
            <div className="form-group">
              <label>Search by Medicine Name</label>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <label>Min Quantity</label>
              <input
                type="number"
                name="minQuantity"
                value={filter.minQuantity}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Max Quantity</label>
              <input
                type="number"
                name="maxQuantity"
                value={filter.maxQuantity}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Start Expiry Date</label>
              <input
                type="date"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>End Expiry Date</label>
              <input
                type="date"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        )}
      </div>
      <div className="stocks-list">
        <h3>Current Stocks</h3>
        {filteredStocks.length === 0 ? (
          <p>No stocks available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.medicine}</td>
                  <td>{stock.quantity}</td>
                  <td>{stock.expiryDate}</td>
                  <td>{stock.location}</td>
                  <td>
                    <button onClick={() => handleEdit(stock)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="stocks-chart">
        <h3>Stock Levels</h3>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Edit Medicine"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>{form.id === null ? 'Add New Medicine' : 'Edit Medicine'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Medicine</label>
            <input
              type="text"
              name="medicine"
              value={form.medicine}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleFormChange}
              required
            />
          </div>
          <button type="submit">{form.id === null ? 'Add Medicine' : 'Update Medicine'}</button>
          <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default Stocks;
