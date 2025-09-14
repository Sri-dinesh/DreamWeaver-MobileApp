
const express = require('express');
const router = express.Router();
const lucidController = require('../controllers/lucid.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.route('/settings').get(lucidController.getLucidSettings).put(lucidController.updateLucidSettings);

module.exports = router;
