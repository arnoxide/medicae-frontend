const PatientFile = require('../models/PatientFile');

exports.createPatientFile = async (req, res) => {
  const { patientId, fullName, gender, dateOfBirth, address, phoneNumber, emailAddress, emergencyContact, medicalHistory, familyHistory, consultationRecords, labResults, vitalSigns, insuranceAndBilling, additionalInformation, appointmentHistory } = req.body;

  try {
    const newPatientFile = new PatientFile({
      patientId,
      fullName,
      gender,
      dateOfBirth,
      address,
      phoneNumber,
      emailAddress,
      emergencyContact,
      medicalHistory,
      familyHistory,
      consultationRecords,
      labResults,
      vitalSigns,
      insuranceAndBilling,
      additionalInformation,
      appointmentHistory
    });

    const savedPatientFile = await newPatientFile.save();
    res.status(201).json(savedPatientFile);
  } catch (error) {
    console.error('Error creating patient file:', error);
    res.status(500).json({ message: 'Error creating patient file', error });
  }
};

exports.getPatientFileById = async (req, res) => {
  const { patientId } = req.params;

  try {
    const patientFile = await PatientFile.findOne({ patientId });
    if (!patientFile) {
      return res.status(404).json({ message: 'Patient file not found' });
    }
    res.status(200).json(patientFile);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving patient file', error });
  }
};

exports.updatePatientFileById = async (req, res) => {
  const { patientId } = req.params;
  const updates = req.body;

  try {
    const updatedPatientFile = await PatientFile.findOneAndUpdate({ patientId }, updates, { new: true });
    if (!updatedPatientFile) {
      return res.status(404).json({ message: 'Patient file not found' });
    }
    res.status(200).json(updatedPatientFile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient file', error });
  }
};

exports.deletePatientFileById = async (req, res) => {
  const { patientId } = req.params;

  try {
    const deletedPatientFile = await PatientFile.findOneAndDelete({ patientId });
    if (!deletedPatientFile) {
      return res.status(404).json({ message: 'Patient file not found' });
    }
    res.status(200).json({ message: 'Patient file deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient file', error });
  }
};
