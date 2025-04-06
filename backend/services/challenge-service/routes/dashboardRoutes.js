const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Alle Routen sind geschützt
router.use(authMiddleware.protect);

// Achievement-Routen
router.get('/achievements', dashboardController.getAchievements);
router.get('/achievements/user/:userId?', dashboardController.getUserAchievements);

// Streak-Routen
router.get('/streak/:userId?', dashboardController.getUserStreak);

// Cracker-Routen
router.get('/crackers/:userId?', dashboardController.getUserCrackers);
router.get('/crackers/transactions/:userId?', dashboardController.getCrackerTransactions);
router.post('/crackers/spend', dashboardController.spendCrackers);

// Task-Routen
router.get('/tasks/:userId?', dashboardController.getUserTasks);
router.post('/tasks/:taskId/complete', dashboardController.completeTask);

// Dashboard-Daten
router.get('/dashboard/:userId?', dashboardController.getDashboardData);

module.exports = router;
