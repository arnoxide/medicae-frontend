const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  staffID: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  profilePicture: { type: String },
  specialist: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  employmentType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  workingHours: { type: String, required: true },
  supervisor: { type: String },
  status: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('Staff', staffSchema);
