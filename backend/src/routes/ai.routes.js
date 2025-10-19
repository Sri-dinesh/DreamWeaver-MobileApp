const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

// AI Prompt routes
router
  .route("/prompts")
  .get(aiController.getAIPrompts)
  .post(aiController.createAIPrompt);
router.delete("/prompts/:id", aiController.deleteAIPrompt);

// Audio Prompt routes
router.get("/audio-prompts", aiController.getAudioPrompts);

// Generation routes
router.post("/generate-prompt", aiController.generatePrompt);
router.post("/generate-affirmation", aiController.generateAffirmation);

// History routes
router.get("/history", aiController.getPromptHistory);
router.delete("/history/:id", aiController.deletePrompt);

module.exports = router;
