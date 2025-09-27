
const express = require('express');
const router = express.Router();
const lucidController = require('../controllers/lucid.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.route('/reality-check').put(lucidController.updateRealityCheckSettings);
router.route('/reality-check/test').post(lucidController.testRealityCheckNotification);
router.route('/statistics').get(lucidController.getLucidDreamStatistics);
router.route('/techniques').get(lucidController.getGuidedTechniques);

module.exports = router;
