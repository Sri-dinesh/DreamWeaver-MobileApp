
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

