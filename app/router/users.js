const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAdmin } = require('../middleware/authMiddleware');

// API Routes
router.get('/api/users', requireAdmin, userController.getAllUsers);
router.delete('/api/users/:id', requireAdmin, userController.deleteUser);

// EJS Routes
router.get('/users', requireAdmin, userController.showUserManagement);

module.exports = router;