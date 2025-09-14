
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// @desc    Get all sleep recordings for a user
// @route   GET /api/recordings
// @access  Private
exports.getSleepRecordings = async (req, res) => {
  try {
    const recordings = await prisma.sleepRecording.findMany({
      where: { user_id: req.userId },
      orderBy: { start_time: 'desc' },
    });
    res.status(200).json(recordings);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Upload a new sleep recording
// @route   POST /api/recordings
// @access  Private
exports.uploadSleepRecording = async (req, res) => {
  const { notes, start_time, end_time, duration_seconds } = req.body;
  const file_path = req.file ? `/recordings/${req.file.filename}` : null;

  if (!file_path) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  try {
    const recording = await prisma.sleepRecording.create({
      data: {
        notes,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        duration_seconds: parseInt(duration_seconds),
        file_path,
        user: { connect: { id: req.userId } },
      },
    });
    res.status(201).json(recording);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Delete a sleep recording
// @route   DELETE /api/recordings/:id
// @access  Private
exports.deleteSleepRecording = async (req, res) => {
  const { id } = req.params;

  try {
    const recording = await prisma.sleepRecording.findUnique({
      where: { id: parseInt(id) },
    });

    if (!recording) {
      return res.status(404).json({ message: 'Sleep recording not found' });
    }

    if (recording.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, `../../public${recording.file_path}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.sleepRecording.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Sleep recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
