const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); 

const sendEmail = async (email, staffID) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetURL = `https://medicae-frontend.vercel.app//reset-password/${resetToken}`;

  console.log('EMAIL:', process.env.EMAIL);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    host: 'mail.theboxlab.co.za',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email, 
    subject: 'Welcome to Medicae!',
    text: `
      Welcome to Medicae!
      Your Staff ID is: ${staffID}.
      Please reset your password using the following link: ${resetURL}.
      Make sure to change your password after logging in for the first time.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

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
    await sendEmail(email, staffID);

    res.status(201).json({ message: 'Staff created successfully' });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Error creating staff', error: error.message });
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
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};
