const express = require('express');
const router = express.Router();
const { sendPasswordResetEmail } = require('../controllers/authController');

router.post('/forgot-password', sendPasswordResetEmail);

module.exports = router;
