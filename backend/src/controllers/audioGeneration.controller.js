const audioGenerationService = require('../services/audioGenerationService');
const supabaseStorageService = require('../services/supabaseStorageService');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// @desc    Generate Binaural Beat
// @route   POST /api/ai/binaural-beat
// @access  Private
exports.generateBinauralBeat = async (req, res) => {
  try {
    const { carrierFrequency, beatFrequency, duration, volume } = req.body;

    // Validate inputs
    if (!carrierFrequency || !beatFrequency || !duration) {
      return res.status(400).json({
        message: 'Carrier frequency, beat frequency, and duration are required',
      });
    }

    // Validate frequency ranges
    if (carrierFrequency < 20 || carrierFrequency > 20000) {
      return res.status(400).json({
        message: 'Carrier frequency must be between 20 Hz and 20000 Hz',
      });
    }

    if (beatFrequency < 0.5 || beatFrequency > 40) {
      return res.status(400).json({
        message: 'Beat frequency must be between 0.5 Hz and 40 Hz',
      });
    }

    if (duration < 1 || duration > 120) {
      return res.status(400).json({
        message: 'Duration must be between 1 and 120 minutes',
      });
    }

    const volumeDbfs = volume || -6;

    // console.log('🎵 Generating binaural beat:', {
    //   carrierFrequency,
    //   beatFrequency,
    //   duration,
    //   volumeDbfs,
    // });

    // Generate audio
    const audioBuffer = audioGenerationService.generateBinauralBeat(
      carrierFrequency,
      beatFrequency,
      duration,
      volumeDbfs
    );

    const fileName = `binaural_${Date.now()}.wav`;

    // console.log('📤 Uploading to Supabase...');

    // Upload to Supabase
    const supabaseResult = await supabaseStorageService.uploadFile(
      audioBuffer,
      fileName,
      'audio/wav'
    );

    if (!supabaseResult) {
      return res.status(500).json({
        message: 'Failed to upload audio to Supabase',
      });
    }

    // console.log('✅ Uploaded to Supabase:', supabaseResult.publicUrl);

    // Save to database using AudioLibrary model
    try {
      const dbRecord = await prisma.audioLibrary.create({
        data: {
          user_id: req.userId,
          title: `Binaural Beat - ${carrierFrequency}Hz`,
          description: `Carrier: ${carrierFrequency}Hz, Beat: ${beatFrequency}Hz, Volume: ${volumeDbfs}dBFS`,
          category: 'binaural',
          file_path: supabaseResult.path,
          storage_url: supabaseResult.publicUrl,
          file_type: 'audio/wav',
          file_size: audioBuffer.length,
          duration_seconds: duration * 60,
          visibility: 'private',
        },
      });
      // console.log('✅ Saved to database:', dbRecord.id);
    } catch (dbError) {
      console.error('❌ Failed to save to database:', dbError.message);
      return res.status(500).json({
        message: 'Failed to save audio record',
        error: dbError.message,
      });
    }

    // console.log('✅ Binaural beat generated:', fileName);

    res.status(200).json({
      message: 'Binaural beat generated successfully',
      audioUrl: supabaseResult.publicUrl,
      fileName,
      size: audioBuffer.length,
      duration,
      format: 'wav',
    });
  } catch (error) {
    console.error('❌ Error generating binaural beat:', error);
    res.status(500).json({
      message: 'Failed to generate binaural beat',
      error: error.message,
    });
  }
};

// @desc    Generate Subliminal Audio
// @route   POST /api/ai/subliminal-audio
// @access  Private
exports.generateSubliminalAudio = async (req, res) => {
  try {
    const { affirmationText, maskingSound, duration, subliminalVolume, maskingVolume } = req.body;

    // Validate inputs
    if (!affirmationText || !maskingSound || !duration) {
      return res.status(400).json({
        message: 'Affirmation text, masking sound, and duration are required',
      });
    }

    if (affirmationText.length < 5 || affirmationText.length > 500) {
      return res.status(400).json({
        message: 'Affirmation text must be between 5 and 500 characters',
      });
    }

    const validMaskingSounds = ['white-noise', 'ambient-tone'];
    if (!validMaskingSounds.includes(maskingSound)) {
      return res.status(400).json({
        message: `Masking sound must be one of: ${validMaskingSounds.join(', ')}`,
      });
    }

    if (duration < 1 || duration > 120) {
      return res.status(400).json({
        message: 'Duration must be between 1 and 120 minutes',
      });
    }

    const subliminalVolumeDbfs = subliminalVolume || -30;
    const maskingVolumeDbfs = maskingVolume || -10;

    // console.log('🎧 Generating subliminal audio:', {
    //   affirmationText: affirmationText.substring(0, 50) + '...',
    //   maskingSound,
    //   duration,
    //   subliminalVolumeDbfs,
    //   maskingVolumeDbfs,
    // });

    // Generate audio
    const audioBuffer = audioGenerationService.generateSubliminalAudio(
      affirmationText,
      maskingSound,
      duration,
      subliminalVolumeDbfs,
      maskingVolumeDbfs
    );

    const fileName = `subliminal_${Date.now()}.wav`;

    // console.log('📤 Uploading to Supabase...');

    // Upload to Supabase
    const supabaseResult = await supabaseStorageService.uploadFile(
      audioBuffer,
      fileName,
      'audio/wav'
    );

    if (!supabaseResult) {
      return res.status(500).json({
        message: 'Failed to upload audio to Supabase',
      });
    }

    // console.log('✅ Uploaded to Supabase:', supabaseResult.publicUrl);

    // Save to database using AudioLibrary model
    try {
      const dbRecord = await prisma.audioLibrary.create({
        data: {
          user_id: req.userId,
          title: `Subliminal Audio - ${maskingSound}`,
          description: `Affirmation: ${affirmationText}\nMasking: ${maskingSound}, Subliminal: ${subliminalVolumeDbfs}dBFS, Masking: ${maskingVolumeDbfs}dBFS`,
          category: 'subliminal',
          file_path: supabaseResult.path,
          storage_url: supabaseResult.publicUrl,
          file_type: 'audio/wav',
          file_size: audioBuffer.length,
          duration_seconds: duration * 60,
          visibility: 'private',
        },
      });
      // console.log('✅ Saved to database:', dbRecord.id);
    } catch (dbError) {
      console.error('❌ Failed to save to database:', dbError.message);
      return res.status(500).json({
        message: 'Failed to save audio record',
        error: dbError.message,
      });
    }

    // console.log('✅ Subliminal audio generated:', fileName);

    res.status(200).json({
      message: 'Subliminal audio generated successfully',
      audioUrl: supabaseResult.publicUrl,
      fileName,
      size: audioBuffer.length,
      duration,
      format: 'wav',
      affirmation: affirmationText,
      maskingSound,
    });
  } catch (error) {
    console.error('❌ Error generating subliminal audio:', error);
    res.status(500).json({
      message: 'Failed to generate subliminal audio',
      error: error.message,
    });
  }
};

// @desc    Get audio file
// @route   GET /api/ai/audio/:fileName
// @access  Public
exports.getAudioFile = async (req, res) => {
  try {
    const { fileName } = req.params;

    // Validate filename to prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/')) {
      return res.status(400).json({ message: 'Invalid file name' });
    }

    const filePath = path.join(__dirname, '../../public/audio', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ Error retrieving audio file:', error);
    res.status(500).json({
      message: 'Failed to retrieve audio file',
      error: error.message,
    });
  }
};

// @desc    Get generated audio history
// @route   GET /api/ai/generated-audio/list
// @access  Private
exports.getGeneratedAudioHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // console.log('📋 Fetching generated audio history for user:', userId);

    // Fetch binaural and subliminal audio from AudioLibrary
    const audioHistory = await prisma.audioLibrary.findMany({
      where: {
        user_id: userId,
        category: {
          in: ['binaural', 'subliminal'],
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match expected format
    const formattedAudio = audioHistory.map((audio) => ({
      id: audio.id,
      type: audio.category,
      fileName: audio.title,
      audioUrl: audio.storage_url,
      duration: Math.round(audio.duration_seconds / 60),
      size: audio.file_size,
      createdAt: audio.created_at,
    }));

    // console.log('✅ Audio history fetched:', formattedAudio.length, 'items');

    res.status(200).json(formattedAudio);
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

    // console.log('🗣️ Deleting audio:', id);

    // Find the audio record
    const audioRecord = await prisma.audioLibrary.findUnique({
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
    if (audioRecord.file_path) {
      await supabaseStorageService.deleteFile(audioRecord.file_path);
    }

    // Delete from database
    await prisma.audioLibrary.delete({
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
