const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Ensure this path is correct

router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.sendPasswordResetEmail);
router.post('/reset-password', authController.resetPassword); // Add this line

module.exports = router;
