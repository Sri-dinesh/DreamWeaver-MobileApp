const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/consistency", analyticsController.getDreamConsistency);
router.get("/emotional-map", analyticsController.getEmotionalSleepMap);
router.get(
  "/emotions-distribution",
  analyticsController.getDreamEmotionsDistribution
);
router.get("/sleep-duration", analyticsController.getSleepDuration);
router.get("/lucid-dreams", analyticsController.getLucidDreamsPerDay);
router.get("/correlations", analyticsController.getSleepDreamCorrelations);

module.exports = router;
