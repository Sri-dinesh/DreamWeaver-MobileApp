
const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/shared.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get dreams from friends
router.get('/friends', authMiddleware, sharedController.getFriendDreams);

// Get public dreams
router.get('/public', authMiddleware, sharedController.getPublicDreams);

module.exports = router;
