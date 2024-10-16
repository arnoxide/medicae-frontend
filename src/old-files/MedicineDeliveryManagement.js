import React, { useState } from 'react';
import '../styles/MedicineDeliveryManagement.css';

const MedicineDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([
    { id: 1, patientName: 'John Doe', medicine: 'Ibuprofen', deliveryDate: '2024-08-30', status: 'Scheduled', courier: 'FedEx', location: '123 Main St' },
    { id: 2, patientName: 'Jane Smith', medicine: 'Paracetamol', deliveryDate: '2024-09-01', status: 'Delivered', courier: 'UPS', location: '456 Elm St' },
    // Add more sample data as needed
  ]);

  const [couriers, setCouriers] = useState(['FedEx', 'UPS']);
  const [locations, setLocations] = useState(['123 Main St', '456 Elm St']);

  const [form, setForm] = useState({
    patientName: '',
    medicine: '',
    deliveryDate: '',
    status: 'Scheduled',
    courier: couriers[0],
    location: locations[0]
  });

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [newCourier, setNewCourier] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDeliveries([...deliveries, { ...form, id: deliveries.length + 1 }]);
    setForm({
      patientName: '',
      medicine: '',
      deliveryDate: '',
      status: 'Scheduled',
      courier: couriers[0],
      location: locations[0]
    });
  };

  const handleCourierSubmit = (e) => {
    e.preventDefault();
    setCouriers([...couriers, newCourier]);
    setNewCourier('');
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    setLocations([...locations, newLocation]);
    setNewLocation('');
  };

  const updateDeliveryStatus = (id, status) => {
    setDeliveries(deliveries.map(delivery => delivery.id === id ? { ...delivery, status } : delivery));
  };

  return (
    <div className="medicine-delivery-management">
      <div className="delivery-header">
        <h1>Medicine Delivery Management</h1>
      </div>
      <div className="collapsible-panel">
        <div className="collapsible-header" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
          <h3>{isPanelCollapsed ? 'Schedule Delivery' : 'Hide Schedule Delivery'}</h3>
          <div className={`arrow ${isPanelCollapsed ? 'down' : 'up'}`}></div>
        </div>
        {!isPanelCollapsed && (
          <div className="delivery-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleFormChange}
                  required
                />
              </div>
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
                <label>Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={form.deliveryDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="form-group">
                <label>Courier</label>
                <select
                  name="courier"
                  value={form.courier}
                  onChange={handleFormChange}
                  required
                >
                  {couriers.map((courier, index) => (
                    <option key={index} value={courier}>{courier}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  required
                >
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <button type="submit">Schedule Delivery</button>
            </form>
          </div>
        )}
      </div>
      <div className="additional-forms">
        <div className="courier-form">
          <h3>Add Courier Company</h3>
          <form onSubmit={handleCourierSubmit}>
            <div className="form-group">
              <label>Courier Name</label>
              <input
                type="text"
                value={newCourier}
                onChange={(e) => setNewCourier(e.target.value)}
                required
              />
            </div>
            <button type="submit">Add Courier</button>
          </form>
        </div>
        <div className="location-form">
          <h3>Add Location</h3>
          <form onSubmit={handleLocationSubmit}>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
              />
            </div>
            <button type="submit">Add Location</button>
          </form>
        </div>
      </div>
      <div className="delivery-list">
        <h3>Track Deliveries</h3>
        {deliveries.length === 0 ? (
          <p>No deliveries scheduled.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Medicine</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Courier</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.patientName}</td>
                  <td>{delivery.medicine}</td>
                  <td>{delivery.deliveryDate}</td>
                  <td>
                    <select
                      value={delivery.status}
                      onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td>{delivery.courier}</td>
                  <td>{delivery.location}</td>
                  <td>
                    {delivery.status === 'Scheduled' && (
                      <button onClick={() => updateDeliveryStatus(delivery.id, 'In Transit')}>Mark as In Transit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MedicineDeliveryManagement;
