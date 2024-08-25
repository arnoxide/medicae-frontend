import React, { useState } from 'react';
import '../styles/Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([
    { id: 1, medicine: 'Ibuprofen', quantity: 100, cost: 50, date: '2024-08-01', paymentMethod: 'Credit Card' },
    { id: 2, medicine: 'Paracetamol', quantity: 200, cost: 80, date: '2024-08-05', paymentMethod: 'Cash' },
    // Add more sample data as needed
  ]);

  const [form, setForm] = useState({
    medicine: '',
    quantity: '',
    cost: '',
    date: '',
    paymentMethod: ''
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    minCost: '',
    maxCost: '',
    startDate: '',
    endDate: '',
    paymentMethod: ''
  });

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
    setPurchases([...purchases, { ...form, id: purchases.length + 1, cost: parseFloat(form.cost) }]);
    setForm({
      medicine: '',
      quantity: '',
      cost: '',
      date: '',
      paymentMethod: ''
    });
  };

  const applyFilters = (purchases) => {
    return purchases.filter((purchase) => {
      const meetsSearchCriteria = purchase.medicine.toLowerCase().includes(search.toLowerCase());
      const meetsCostCriteria =
        (!filter.minCost || purchase.cost >= parseFloat(filter.minCost)) &&
        (!filter.maxCost || purchase.cost <= parseFloat(filter.maxCost));
      const meetsDateCriteria =
        (!filter.startDate || new Date(purchase.date) >= new Date(filter.startDate)) &&
        (!filter.endDate || new Date(purchase.date) <= new Date(filter.endDate));
      const meetsPaymentMethodCriteria =
        !filter.paymentMethod || purchase.paymentMethod === filter.paymentMethod;

      return meetsSearchCriteria && meetsCostCriteria && meetsDateCriteria && meetsPaymentMethodCriteria;
    });
  };

  const filteredPurchases = applyFilters(purchases);

  return (
    <div className="purchases">
      <div className="purchases-header">
        <h1>Medicine Purchase History</h1>
      </div>
      <div className="purchases-form">
        <h3>Add New Purchase</h3>
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
            <label>Cost</label>
            <input
              type="number"
              step="0.01"
              name="cost"
              value={form.cost}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <button type="submit">Add Purchase</button>
        </form>
      </div>
      <div className="purchases-filters">
        <h3>Filters</h3>
        <div className="form-group">
          <label>Search by Medicine Name</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="form-group">
          <label>Min Cost</label>
          <input
            type="number"
            step="0.01"
            name="minCost"
            value={filter.minCost}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label>Max Cost</label>
          <input
            type="number"
            step="0.01"
            name="maxCost"
            value={filter.maxCost}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="paymentMethod"
            value={filter.paymentMethod}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>
      </div>
      <div className="purchases-list">
        <h3>Existing Purchases</h3>
        {filteredPurchases.length === 0 ? (
          <p>No purchases available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.medicine}</td>
                  <td>{purchase.quantity}</td>
                  <td>${purchase.cost.toFixed(2)}</td>
                  <td>{purchase.date}</td>
                  <td>{purchase.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Purchases;
