const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const secretKey = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'nurse'] } });
    res.json(staff);
  } catch (error) {
    res.status(500).send('Error fetching staff');
  }
};

exports.addStaff = async (req, res) => {
  const { username, role } = req.body;
  try {
    const password = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    const mailOptions = {
      from: process.env.EMAIL,
      to: username, // Assuming username is an email
      subject: 'Welcome to the Clinic',
      text: `Welcome! Your temporary password is ${password}. Please login and change your password.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).send('Staff added successfully');
  } catch (error) {
    res.status(500).send('Error adding staff');
  }
};

exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).send('Staff deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting staff');
  }
};
