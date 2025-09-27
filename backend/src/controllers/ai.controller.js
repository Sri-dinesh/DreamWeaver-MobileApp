
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get all AI prompts for a user
// @route   GET /api/ai/prompts
// @access  Private
exports.getAIPrompts = async (req, res) => {
  try {
    const prompts = await prisma.aIPrompt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Create a new AI prompt
// @route   POST /api/ai/prompts
// @access  Private
exports.createAIPrompt = async (req, res) => {
  const { userInput, promptType } = req.body;

  if (!userInput || !promptType) {
    return res.status(400).json({ message: 'UserInput and promptType are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a creative assistant. Generate a ${promptType} prompt based on the following input: ${userInput}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const ai_response = response.text();

    const newPrompt = await prisma.aIPrompt.create({
      data: {
        user_input: userInput,
        ai_response,
        user: { connect: { id: req.userId } },
      },
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

const gtts = require('gtts');
const path = require('path');
const fs = require('fs');

// @desc    Delete an AI prompt
// @route   DELETE /api/ai/prompts/:id
// @access  Private
exports.deleteAIPrompt = async (req, res) => {
  const { id } = req.params;

  try {
    const prompt = await prisma.aIPrompt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    if (prompt.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await prisma.aIPrompt.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Get all audio prompts for a user
// @route   GET /api/audio/prompts
// @access  Private
exports.getAudioPrompts = async (req, res) => {
  try {
    const prompts = await prisma.audioPrompt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Create a new audio prompt from an AI prompt using TTS
// @route   POST /api/audio/prompts/tts
// @access  Private
exports.createAudioPromptFromTTS = async (req, res) => {
  const { promptId } = req.body;

  if (!promptId) {
    return res.status(400).json({ message: 'PromptId is required' });
  }

  try {
    const aiPrompt = await prisma.aIPrompt.findUnique({
      where: { id: parseInt(promptId) },
    });

    if (!aiPrompt) {
      return res.status(404).json({ message: 'AI Prompt not found' });
    }

    if (aiPrompt.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    const text = aiPrompt.ai_response;
    const speech = new gtts(text, 'en');
    const fileName = `${Date.now()}.mp3`;
    const filePath = path.join(__dirname, `../../public/audio/${fileName}`);

    speech.save(filePath, async (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to save audio file', error: err });
      }

      const newAudioPrompt = await prisma.audioPrompt.create({
        data: {
          original_text: text,
          file_path: `/audio/${fileName}`,
          user: { connect: { id: req.userId } },
          ai_prompt: { connect: { id: aiPrompt.id } },
        },
      });

      res.status(201).json(newAudioPrompt);
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Delete an audio prompt
// @route   DELETE /api/audio/prompts/:id
// @access  Private
exports.deleteAudioPrompt = async (req, res) => {
  const { id } = req.params;

  try {
    const audioPrompt = await prisma.audioPrompt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!audioPrompt) {
      return res.status(404).json({ message: 'Audio prompt not found' });
    }

    if (audioPrompt.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, `../../public${audioPrompt.file_path}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.audioPrompt.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Audio prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

exports.generateAffirmation = async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate a positive affirmation for sleep or lucid dreaming based on the following text: "${text}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const affirmation = response.text();

        res.status(200).json({ affirmation });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.generateCreativePrompt = async (req, res) => {
    const { promptType, theme } = req.body;

    if (!promptType || !theme) {
        return res.status(400).json({ message: 'Prompt type and theme are required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate a ${promptType} prompt with the theme of "${theme}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const creativePrompt = response.text();

        res.status(200).json({ creativePrompt });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

const { WaveFile } = require('wavefile');

exports.generateBinauralBeat = async (req, res) => {
    const { carrierFreq, beatFreq, duration, volume } = req.body;

    if (!carrierFreq || !beatFreq || !duration || !volume) {
        return res.status(400).json({ message: 'Carrier frequency, beat frequency, duration, and volume are required' });
    }

    try {
        const sampleRate = 44100;
        const bitDepth = '16';
        const numSamples = sampleRate * duration * 60;

        const leftFreq = carrierFreq - beatFreq / 2;
        const rightFreq = carrierFreq + beatFreq / 2;

        const leftSamples = new Int16Array(numSamples);
        const rightSamples = new Int16Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const time = i / sampleRate;
            leftSamples[i] = Math.floor(volume * Math.sin(2 * Math.PI * leftFreq * time) * 32767);
            rightSamples[i] = Math.floor(volume * Math.sin(2 * Math.PI * rightFreq * time) * 32767);
        }

        const interleaved = new Int16Array(numSamples * 2);
        for (let i = 0; i < numSamples; i++) {
            interleaved[i * 2] = leftSamples[i];
            interleaved[i * 2 + 1] = rightSamples[i];
        }

        let wav = new WaveFile();
        wav.fromScratch(2, sampleRate, bitDepth, interleaved);

        const fileName = `${Date.now()}.wav`;
        const filePath = path.join(__dirname, `../../public/audio/${fileName}`);
        fs.writeFileSync(filePath, wav.toBuffer());

        res.status(200).json({ filePath: `/audio/${fileName}` });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.generateSubliminalAudio = async (req, res) => {
    const { affirmationText, maskingSound, duration, subliminalVolume, maskingVolume } = req.body;

    if (!affirmationText || !maskingSound || !duration || !subliminalVolume || !maskingVolume) {
        return res.status(400).json({ message: 'Affirmation text, masking sound, duration, subliminal volume, and masking volume are required' });
    }

    try {
        const speech = new gtts(affirmationText, 'en');
        const tempFileName = `${Date.now()}_temp.mp3`;
        const tempFilePath = path.join(__dirname, `../../public/audio/${tempFileName}`);

        speech.save(tempFilePath, async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save temporary audio file', error: err });
            }

            res.status(200).json({ message: 'Subliminal audio generation is in progress.' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

