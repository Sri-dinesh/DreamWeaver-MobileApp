const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

router.post("/generate-prompt", aiController.generatePrompt);
router.post("/generate-affirmation", aiController.generateAffirmation);
router.get("/history", aiController.getPromptHistory);
router.delete("/history/:id", aiController.deletePrompt);

router.route("/audio/prompts").get(aiController.getAudioPrompts);
router.route("/audio/prompts/tts").post(aiController.createAudioPromptFromTTS);
router.route("/audio/prompts/:id").delete(aiController.deleteAudioPrompt);

router
  .route("/prompts")
  .get(aiController.getAIPrompts)
  .post(aiController.createAIPrompt);
router.route("/prompts/:id").delete(aiController.deleteAIPrompt);

module.exports = router;
