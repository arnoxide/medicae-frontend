const express = require('express');
const {
  createPatient,
  getPatientById,
  getAllPatients,
  updatePatientById,
  deletePatientById,
} = require('../controllers/patientController');
const router = express.Router();

router.post('/', createPatient);
router.get('/:id', getPatientById);
router.get('/', getAllPatients);
router.put('/:id', updatePatientById);
router.delete('/:id', deletePatientById);

module.exports = router;
