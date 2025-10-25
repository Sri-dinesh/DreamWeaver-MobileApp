const { PrismaClient } = require('@prisma/client');
const supabaseStorageService = require('../services/supabaseStorageService');

const prisma = new PrismaClient();

// @desc    Get generated audio history
// @route   GET /api/ai/generated-audio/list
// @access  Private
exports.getGeneratedAudioHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // console.log('📋 Fetching generated audio history for user:', userId);

    const audioHistory = await prisma.audioGeneration.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        fileName: true,
        audioUrl: true,
        duration: true,
        size: true,
        affirmation: true,
        maskingSound: true,
        parameters: true,
        createdAt: true,
      },
    });

    // console.log('✅ Audio history fetched:', audioHistory.length, 'items');

    res.status(200).json(audioHistory);
  } catch (error) {
    console.error('❌ Error fetching audio history:', error);
    res.status(500).json({
      message: 'Failed to fetch audio history',
      error: error.message,
    });
  }
};

// @desc    Delete generated audio
// @route   DELETE /api/ai/generated-audio/:id
// @access  Private
exports.deleteGeneratedAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // console.log('🗑️ Deleting audio:', id);

    // Find the audio record
    const audioRecord = await prisma.audioGeneration.findUnique({
      where: { id: parseInt(id) },
    });

    if (!audioRecord) {
      return res.status(404).json({ message: 'Audio not found' });
    }

    // Verify ownership
    if (audioRecord.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this audio' });
    }

    // Delete from Supabase if path exists
    if (audioRecord.supabasePath) {
      await supabaseStorageService.deleteFile(audioRecord.supabasePath);
    }

    // Delete from database
    await prisma.audioGeneration.delete({
      where: { id: parseInt(id) },
    });

    // console.log('✅ Audio deleted successfully');

    res.status(200).json({ message: 'Audio deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting audio:', error);
    res.status(500).json({
      message: 'Failed to delete audio',
      error: error.message,
    });
  }
};
