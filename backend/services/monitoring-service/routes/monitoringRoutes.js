const express = require('express');
const monitoringController = require('../controllers/monitoringController');
const authMiddleware = require('../../../middleware/auth');

const router = express.Router();

// Nur für Admins zugänglich
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/status', monitoringController.getServiceStatus);
router.get('/metrics', monitoringController.getMetrics);

module.exports = router; 