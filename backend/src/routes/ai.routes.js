
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.route('/prompts').get(aiController.getAIPrompts).post(aiController.createAIPrompt);
router.route('/prompts/:id').delete(aiController.deleteAIPrompt);

router.route('/audio/prompts').get(aiController.getAudioPrompts);
router.route('/audio/prompts/tts').post(aiController.createAudioPromptFromTTS);
router.route('/audio/prompts/:id').delete(aiController.deleteAudioPrompt);

router.route('/affirmation').post(aiController.generateAffirmation);
router.route('/creative-prompt').post(aiController.generateCreativePrompt);
router.route('/binaural-beat').post(aiController.generateBinauralBeat);
router.route('/subliminal-audio').post(aiController.generateSubliminalAudio);

module.exports = router;
