
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Dream Consistency Insights
router.get('/consistency', authMiddleware, analyticsController.getDreamConsistency);

// Emotional Sleep Map
router.get('/emotional-map', authMiddleware, analyticsController.getEmotionalSleepMap);

// Dream Emotions Distribution
router.get('/emotions-distribution', authMiddleware, analyticsController.getDreamEmotionsDistribution);

// Last 30 Days Sleep Duration
router.get('/sleep-duration', authMiddleware, analyticsController.getSleepDuration);

// Lucid Dreams per Day
router.get('/lucid-dreams', authMiddleware, analyticsController.getLucidDreamsPerDay);

// Sleep & Dream Correlations
router.get('/correlations', authMiddleware, analyticsController.getSleepDreamCorrelations);

module.exports = router;
