const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
    const { idNumber, date, time, doctor, reason } = req.body;
  
    try {
      const patient = await Patient.findOne({ idNumber });
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      const newAppointment = new Appointment({
        patientId: patient._id,
        date,
        time,
        doctor,
        reason
      });
  
      const savedAppointment = await newAppointment.save();
      res.status(201).json(savedAppointment);
    } catch (error) {
      res.status(500).json({ message: 'Error creating appointment', error });
    }
  };

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('patientId', 'firstName lastName');
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error });
  }
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error });
  }
};

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
};
