const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routen
router.get('/profile/:userId', userController.getProfile);
router.get('/stats/:userId', userController.getStats);

// Geschützte Routen
router.use(authMiddleware.protect);

router.patch('/profile',
  userController.uploadProfileImage,
  userController.updateProfile
);

router.patch('/preferences', userController.updatePreferences);

module.exports = router; 