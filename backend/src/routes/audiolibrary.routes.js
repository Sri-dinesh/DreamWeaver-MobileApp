const express = require("express");
const router = express.Router();
const audioLibraryController = require("../controllers/audiolibrary.controller");
const authenticateToken = require("../middleware/auth.middleware");
const multer = require("multer");

// Configure multer for audio file uploads
const storage = multer.memoryStorage(); // Store in memory for Supabase upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for larger audio files
    files: 1, // Only allow one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Upload audio file - apply multer before authentication
router.post("/upload", (req, res, next) => {
  // console.log('=== Upload Request Received ===');
  // console.log('Headers:', req.headers);
  // console.log('Content-Type:', req.headers['content-type']);
  // console.log('Content-Length:', req.headers['content-length']);
  // console.log('Body keys:', Object.keys(req.body || {}));
  // console.log('Files keys:', req.files ? Object.keys(req.files) : 'No files');
  next();
}, upload.single('audio'), (req, res, next) => {
  // console.log('=== After Multer Processing ===');
  // console.log('Multer processed file:', req.file);
  // console.log('Multer processed body:', req.body);
  if (!req.file) {
    // console.log('WARNING: No file found after multer processing');
    // console.log('All request properties:', Object.keys(req));
    // console.log('Request body:', req.body);
    // Check if file might be in a different field
    if (req.body && req.body.audio) {
      // console.log('Found audio in body:', typeof req.body.audio, req.body.audio);
    }
  }
  next();
}, authenticateToken, audioLibraryController.uploadAudio);

// All other routes require authentication
router.use(authenticateToken);

// Get all user's audio files
router.get("/", audioLibraryController.getUserAudio);

// Get specific audio file
router.get("/:id", audioLibraryController.getAudioById);

// Update audio file metadata
router.put("/:id", audioLibraryController.updateAudio);

// Delete audio file
router.delete("/:id", audioLibraryController.deleteAudio);

module.exports = router;
