import React, { useState } from 'react';
import '../styles/PaymentMethods.css';

const PaymentMethods = () => {
  const allPaymentMethods = [
    { id: 1, name: 'Credit Card', details: ['Card Number', 'Expiry Date', 'CVV'] },
    { id: 2, name: 'Cash', details: ['Receipt Number'] },
    { id: 3, name: 'Bank Transfer', details: ['Bank Name', 'Account Number', 'Routing Number'] },
    { id: 4, name: 'Insurance', details: ['Insurance Company', 'Policy Number', 'Coverage Amount'] },
    // Add more payment methods as needed
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [paymentMethods, setPaymentMethods] = useState(allPaymentMethods);

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Payment Method Submitted:', selectedPaymentMethod, paymentDetails);
    // Logic to save the payment method and details
    setSelectedPaymentMethod('');
    setPaymentDetails({});
  };

  const getDetailsForSelectedMethod = () => {
    const method = paymentMethods.find(method => method.name === selectedPaymentMethod);
    return method ? method.details : [];
  };

  return (
    <div className="payment-methods">
      <div className="payment-methods-header">
        <h1>Payment Methods</h1>
      </div>
      <div className="payment-methods-form">
        <h3>Add New Payment Method</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={handlePaymentMethodChange}
              required
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.name}>{method.name}</option>
              ))}
            </select>
          </div>
          {getDetailsForSelectedMethod().map(detail => (
            <div className="form-group" key={detail}>
              <label>{detail}</label>
              <input
                type="text"
                name={detail.toLowerCase().replace(' ', '_')}
                value={paymentDetails[detail.toLowerCase().replace(' ', '_')] || ''}
                onChange={handleDetailChange}
                required
              />
            </div>
          ))}
          <button type="submit">Add Payment Method</button>
        </form>
      </div>
      <div className="payment-methods-list">
        <h3>Existing Payment Methods</h3>
        {paymentMethods.length === 0 ? (
          <p>No payment methods available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map(method => (
                <tr key={method.id}>
                  <td>{method.id}</td>
                  <td>{method.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
