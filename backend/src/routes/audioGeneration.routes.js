const express = require('express');
const router = express.Router();
const audioGenerationController = require('../controllers/audioGeneration.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

// Binaural Beat endpoints
router.post('/binaural-beat', audioGenerationController.generateBinauralBeat);

// Subliminal Audio endpoints
router.post('/subliminal-audio', audioGenerationController.generateSubliminalAudio);

// Get audio file
router.get('/audio/:fileName', audioGenerationController.getAudioFile);

// Get generated audio history
router.get('/generated-audio/list', audioGenerationController.getGeneratedAudioHistory);

// Delete generated audio
router.delete('/generated-audio/:id', audioGenerationController.deleteGeneratedAudio);

module.exports = router;
