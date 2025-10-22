const express = require("express");
const router = express.Router();
const publicAudioController = require("../controllers/public-audio.controller");

// Get all public audio files from the Music folder
router.get("/public", publicAudioController.getPublicAudioFiles);

module.exports = router;
