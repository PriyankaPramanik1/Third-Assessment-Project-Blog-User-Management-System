const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadProfile, handleUploadError } = require('../middleware/uploadMiddleware');

// API Routes
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.get('/api/auth/logout', requireAuth, authController.logout);

// EJS Routes
router.get('/register', authController.showRegister);
router.get('/login', authController.showLogin);
router.get('/dashboard', requireAuth, authController.showDashboard);

module.exports = router;