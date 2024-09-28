const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Admin model
const Staff = require('../models/Staff'); // Staff model
const secretKey = process.env.SECRET_KEY;

exports.loginUser = async (req, res) => {
  const { username, staffID, password, role } = req.body;

  try {
    let user;
    if (role === 'admin') {
      // Admin login using username
      user = await User.findOne({ username });
      if (!user) {
        return res.status(400).send('Admin not found');
      }
    } else {
      // Staff login using staffID
      user = await Staff.findOne({ staffID });
      if (!user) {
        return res.status(400).send('Staff not found');
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
    return res.json({ token, role: user.role });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).send('Error logging in');
  }
};
