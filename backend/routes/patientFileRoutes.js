const express = require('express');
const {
  createPatientFile,
  getPatientFileById,
  updatePatientFileById,
  deletePatientFileById
} = require('../controllers/patientFileController');
const router = express.Router();

router.post('/', createPatientFile);
router.get('/:patientId', getPatientFileById);
router.put('/:patientId', updatePatientFileById);
router.delete('/:patientId', deletePatientFileById);

module.exports = router;
