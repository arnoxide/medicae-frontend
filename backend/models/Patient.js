const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true // Ensure uniqueness
  },
  hasFile: {
    type: Number,
    default: 0 // 0 for no file, 1 for has file
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
