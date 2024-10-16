const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Utility function to send an email
const sendEmail = async (email, staffID) => {
  // Generate a reset token for the staff member
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

  // Configure the email transporter
  const transporter = nodemailer.createTransport({
    host: 'mail.theboxlab.co.za',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Medicae!',
    text: `
      Welcome to Medicae!
      Your Staff ID is: ${staffID}.
      Please reset your password using the following link: ${resetURL}.
      Make sure to change your password after logging in for the first time.
    `,
  };

  // Attempt to send the email and log success or failure
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

// Controller function to create a new staff member
exports.createStaff = async (req, res) => {
  const {
    staffID, fullName, email, phone, gender, dob, password, address, profilePicture, specialist,
    role, department, employmentType, startDate, endDate, workingHours, supervisor, status,
  } = req.body;

  // Validate required fields
  if (!staffID || !fullName || !email || !password || !role || !department) {
    return res.status(400).json({ message: 'All required fields must be filled out.' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Staff instance
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

    // Save the new staff member to the database
    await newStaff.save();

    // Send a welcome email
    await sendEmail(email, staffID);

    // Respond with success
    res.status(201).json({ message: 'Staff created successfully' });
  } catch (error) {
    // Log and respond with the error
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
};

// Controller function to get all staff members
exports.getAllStaff = async (req, res) => {
  try {
    // Fetch all staff members from the database
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    // Log and respond with the error
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

// Controller function to get all active doctors
exports.getDoctors = async (req, res) => {
  try {
    // Fetch active doctors from the database
    const doctors = await Staff.find({ role: 'Doctor', status: 'active' });
    res.status(200).json(doctors);
  } catch (error) {
    // Log and respond with the error
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};
