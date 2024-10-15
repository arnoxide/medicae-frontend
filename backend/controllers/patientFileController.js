const PatientFile = require('../models/PatientFile');

exports.createPatientFile = async (req, res) => {
  const { idNumber } = req.body;

  try {
    const existingFile = await PatientFile.findOne({ idNumber });
    if (existingFile) {
      return res.status(400).json({ message: 'Patient file already exists for this ID number.' });
    }

    const newFile = new PatientFile(req.body);
    const savedFile = await newFile.save();
    res.status(201).json(savedFile);
  } catch (error) {
    console.error('Error creating patient file:', error);
    res.status(500).json({ message: 'Error creating patient file', error });
  }
};

exports.getPatientFileById = async (req, res) => {
  const { idNumber } = req.params;
  console.log('Fetching file for ID:', idNumber);

  try {
    const patientFile = await PatientFile.findOne({ idNumber });
    if (!patientFile) {
      console.log('Patient file not found for ID:', idNumber);
      return res.status(404).json({ message: 'Patient file not found' });
    }
    console.log('Patient file found:', patientFile);
    res.status(200).json(patientFile);
  } catch (error) {
    console.error('Error retrieving patient file:', error);
    res.status(500).json({ message: 'Error retrieving patient file', error });
  }
};


exports.updatePatientFileById = async (req, res) => {
  const { patientId } = req.params;
  const updates = req.body;

  try {
    const updatedFile = await PatientFile.findOneAndUpdate({ patientId }, updates, { new: true });
    if (!updatedFile) {
      return res.status(404).json({ message: 'Patient file not found' });
    }
    res.status(200).json(updatedFile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient file', error });
  }
};

exports.deletePatientFileById = async (req, res) => {
  const { patientId } = req.params;

  try {
    const deletedFile = await PatientFile.findOneAndDelete({ patientId });
    if (!deletedFile) {
      return res.status(404).json({ message: 'Patient file not found' });
    }
    res.status(200).json({ message: 'Patient file deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient file', error });
  }
};
