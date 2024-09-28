const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/create', authenticateJWT, staffController.createStaff);
router.get('/all', authenticateJWT, staffController.getAllStaff);

module.exports = router;
