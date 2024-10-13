const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

exports.createStaff = async (req, res) => {
  const {
    staffID, fullName, email, phone, gender, dob, password, address, profilePicture, specialist,
    role, department, employmentType, startDate, endDate, workingHours, supervisor, status,
  } = req.body;

  if (!staffID || !fullName || !email || !password || !role || !department) {
    return res.status(400).json({ message: 'All required fields must be filled out.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      staffID,
      fullName,
      email,
      phone,
      gender,
      dob,
      password: hashedPassword,
      address,
      profilePicture,
      specialist,
      role,
      department,
      employmentType,
      startDate,
      endDate,
      workingHours,
      supervisor,
      status,
    });

    await newStaff.save();
    await sendEmail(email, password);

    res.status(201).json({ message: 'Staff created successfully' });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
};

const sendEmail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.theboxlab.co.za',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Medicae!',
    text: `Your account has been created. Your password is: ${password}. Please reset your password after your first login.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Staff.find({ role: 'Doctor', status: 'active' });
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error });
  }
};
