const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        required: true
    }
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;
