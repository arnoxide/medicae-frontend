const express = require('express');
const { getStaff, addStaff, deleteStaff } = require('../controllers/userController');
const router = express.Router();

router.get('/', getStaff);
router.post('/', addStaff);
router.delete('/:id', deleteStaff);

module.exports = router; // Ensure correct export
