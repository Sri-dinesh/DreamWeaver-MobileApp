const express = require("express");
const router = express.Router();
const sleepController = require("../controllers/sleep.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

router.get("/stats", sleepController.getSleepStats);
router.post("/generate-ritual", sleepController.generateRitual);

router
  .route("/plans")
  .get(sleepController.getSleepPlans)
  .post(sleepController.createOrUpdateSleepPlan);

router.route("/plans/:date").get(sleepController.getSleepPlanByDate);
router.route("/plans/:id").delete(sleepController.deleteSleepPlan);
router.get("/search", sleepController.searchSleepPlans);

module.exports = router;