const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const patientFileSchema = new Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  fullName: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
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
