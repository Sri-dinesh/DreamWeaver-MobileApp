
const express = require('express');
const router = express.Router();
const sleeprecordingController = require('../controllers/sleeprecording.controller');
const verifyToken = require('../middleware/auth.middleware');
const uploadRecording = require('../middleware/uploadRecording.middleware');

router.use(verifyToken);

router.route('/').get(sleeprecordingController.getSleepRecordings).post(uploadRecording.single('audio'), sleeprecordingController.uploadSleepRecording);
router.route('/:id').delete(sleeprecordingController.deleteSleepRecording);

module.exports = router;
