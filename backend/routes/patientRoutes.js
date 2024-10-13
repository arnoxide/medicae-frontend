const express = require('express');
const {
    createPatient,
    getPatientByIdNumber,
    getSinglePatient,
    getAllPatients,
    updatePatientById,
    deletePatientById
} = require('../controllers/patientController');
const router = express.Router();

router.post('/', createPatient);
router.get('/idNumber/:idNumber', getPatientByIdNumber);
router.get('/', getAllPatients);
router.put('/:id', updatePatientById);
router.get('/:id', getSinglePatient);
router.delete('/:id', deletePatientById);

module.exports = router;
