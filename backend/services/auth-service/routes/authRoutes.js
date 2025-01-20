const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// User Routes
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/update-me', authController.updateMe);
router.patch('/update-password', authController.updatePassword);
router.patch('/me', userController.updateProfile);
router.patch('/me/preferences', userController.updatePreferences);
router.get('/stats/:userId', userController.getStats);
router.patch('/stats', userController.updateStats);

module.exports = router; 