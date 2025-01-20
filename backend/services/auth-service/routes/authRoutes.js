const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.post('/refresh-token', authController.refreshToken);

// User Routes
router.get('/me', auth, userController.getProfile);
router.patch('/me', auth, userController.updateProfile);
router.patch('/me/preferences', auth, userController.updatePreferences);
router.get('/stats/:userId', auth, userController.getStats);
router.patch('/stats', auth, userController.updateStats);

module.exports = router; 