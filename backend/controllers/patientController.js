const Patient = require('../models/Patient');

exports.createPatient = async (req, res) => {
  const { firstName, lastName, dateOfBirth, address, phoneNumber, email, gender, idNumber } = req.body;


  if (!firstName || !lastName || !dateOfBirth || !address || !address.street || !address.city || !address.state || !address.zipCode || !phoneNumber || !email || !gender) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    const newPatient = new Patient({
      firstName,
      lastName,
      dateOfBirth,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      phoneNumber,
      email,
      gender,
      idNumber,
      hasFile: 0
    });

    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Patient with this ID/Passport number already exists.' });
    } else {
      res.status(500).json({ message: 'Error creating patient', error });
    }
  }
};

exports.getPatientByIdNumber = async (req, res) => {
  const { idNumber } = req.params;

  try {
    const patient = await Patient.findOne({ idNumber });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving patient', error });
  }
};


exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving patients', error });
  }
};

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
