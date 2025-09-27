
const express = require('express');
const router = express.Router();
const audiolibraryController = require('../controllers/audiolibrary.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// Upload audio
router.post('/upload', authMiddleware, uploadMiddleware.single('audio'), audiolibraryController.uploadAudio);

// Get user's audio collection
router.get('/', authMiddleware, audiolibraryController.getAudioCollection);

// Add sample audio
router.post('/add-sample', authMiddleware, audiolibraryController.addSampleAudio);

module.exports = router;
