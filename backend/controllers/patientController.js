const Patient = require('../models/Patient');

// Create a new patient
exports.createPatient = async (req, res) => {
  const { firstName, lastName, dateOfBirth, address, phoneNumber, email } = req.body;

  try {
    const newPatient = new Patient({
      firstName,
      lastName,
      dateOfBirth,
      address,
      phoneNumber,
      email,
    });

    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Error creating patient:', error); // Improved logging
    res.status(500).json({ message: 'Error creating patient', error });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving patient', error });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving patients', error });
  }
};

// Update patient by ID
exports.updatePatientById = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedPatient = await Patient.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error });
  }
};

// Delete patient by ID
exports.deletePatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPatient = await Patient.findByIdAndDelete(id);
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error });
  }
};
