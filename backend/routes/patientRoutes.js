const express = require('express');
const {
  createPatient,
  getPatientByIdNumber,
  getAllPatients,
  updatePatientById,
  deletePatientById
} = require('../controllers/patientController');
const router = express.Router();

// Define routes
router.post('/', createPatient);
router.get('/idNumber/:idNumber', getPatientByIdNumber);
router.get('/', getAllPatients);
router.put('/:id', updatePatientById);
router.delete('/:id', deletePatientById);

module.exports = router;
