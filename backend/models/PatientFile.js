const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const patientFileSchema = new Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: false },
  fullName: {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false }
  },
  gender: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zipCode: { type: String, required: false }
  },
  phoneNumber: { type: String, required: false },
  emailAddress: { type: String, required: false },
  emergencyContact: { type: String, required:false},
  medicalHistory: {
    pastMedicalConditions: { type: [String], default: [] },
    pastSurgeries: { type: [String], default: [] },
    chronicIllnesses: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    vaccinationHistory: { type: [String], default: [] }
  },
  familyHistory: {
    geneticDiseases: { type: [String], default: [] },
    familyMedicalConditions: { type: [String], default: [] }
  },
  consultationRecords: [{
    visitDate: { type: Date },
    symptoms: { type: String },
    diagnosis: { type: String },
    treatmentPlan: { type: String },
    prescribedMedications: { type: String },
    referrals: { type: String },
    notes: { type: String }
  }],
  labResults: [{
    testName: { type: String },
    result: { type: String },
    imagingReports: { type: String }
  }],
  vitalSigns: {
    bloodPressure: { type: String },
    heartRate: { type: String },
    temperature: { type: String },
    weight: { type: String },
    height: { type: String },
    bmi: { type: String }
  },
  insuranceAndBilling: {
    insuranceInformation: { type: String },
    paymentHistory: { type: String }
  },
  additionalInformation: {
    advanceDirectives: { type: String },
    consentForms: { type: String },
    medicalImages: { type: String },
    nextOfKinInformation: { type: String }
  },
  appointmentHistory: {
    upcomingAppointments: { type: [String], default: [] },
    pastAppointments: { type: [String], default: [] }
  }
}, { timestamps: true });

const PatientFile = mongoose.model('PatientFile', patientFileSchema);

module.exports = PatientFile;
