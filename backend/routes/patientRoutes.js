const express = require('express');
const {
  createPatient,
  getPatientById,
  getAllPatients,   // Ensure this is correctly imported
  updatePatientById,
  deletePatientById
} = require('../controllers/patientController'); // Ensure correct path to the controller
const router = express.Router();

// Define routes
router.post('/', createPatient);
router.get('/', getAllPatients); // Ensure this route is defined
router.get('/:id', getPatientById);
router.put('/:id', updatePatientById);
router.delete('/:id', deletePatientById);

module.exports = router;
