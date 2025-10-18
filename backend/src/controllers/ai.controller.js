const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get all AI prompts for a user
// @route   GET /api/ai/prompts
// @access  Private
exports.getAIPrompts = async (req, res) => {
  try {
    const prompts = await prisma.aIPrompt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Create a new AI prompt
// @route   POST /api/ai/prompts
// @access  Private
exports.createAIPrompt = async (req, res) => {
  const { userInput, promptType } = req.body;

  if (!userInput || !promptType) {
    return res
      .status(400)
      .json({ message: "UserInput and promptType are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const gtts = require("gtts");
const path = require("path");
const fs = require("fs");

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
      return res.status(404).json({ message: "Prompt not found" });
    }

    if (prompt.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await prisma.aIPrompt.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Prompt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Get all audio prompts for a user
// @route   GET /api/audio/prompts
// @access  Private
exports.getAudioPrompts = async (req, res) => {
  try {
    const prompts = await prisma.audioPrompt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Create a new audio prompt from an AI prompt using TTS
// @route   POST /api/audio/prompts/tts
// @access  Private
exports.createAudioPromptFromTTS = async (req, res) => {
  const { promptId } = req.body;

  if (!promptId) {
    return res.status(400).json({ message: "PromptId is required" });
  }

  try {
    const aiPrompt = await prisma.aIPrompt.findUnique({
      where: { id: parseInt(promptId) },
    });

    if (!aiPrompt) {
      return res.status(404).json({ message: "AI Prompt not found" });
    }

    if (aiPrompt.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    const text = aiPrompt.ai_response;
    const speech = new gtts(text, "en");
    const fileName = `${Date.now()}.mp3`;
    const filePath = path.join(__dirname, `../../public/audio/${fileName}`);

    speech.save(filePath, async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to save audio file", error: err });
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
    res.status(500).json({ message: "Something went wrong", error });
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
      return res.status(404).json({ message: "Audio prompt not found" });
    }

    if (audioPrompt.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Delete the file from the filesystem
    const filePath = path.join(
      __dirname,
      `../../public${audioPrompt.file_path}`
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.audioPrompt.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Audio prompt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Generate Creative/Reflection Prompt
// @route   POST /api/ai/generate-prompt
// @access  Private
exports.generatePrompt = async (req, res) => {
  const { promptType, theme } = req.body;
  const userId = req.userId;

  if (!promptType || !theme) {
    return res.status(400).json({
      message: "Prompt type and theme are required",
    });
  }

  // Validate prompt type
  const validTypes = ["creative", "reflection", "incubation"];
  if (!validTypes.includes(promptType)) {
    return res.status(400).json({
      message: "Invalid prompt type",
    });
  }

  try {
    console.log("🤖 Generating prompt with Gemini AI...");
    console.log("Type:", promptType, "Theme:", theme);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompts = {
      creative: `Create a creative writing prompt for lucid dreaming about "${theme}". Make it engaging and imaginative. Start directly with the prompt, no intro.`,
      reflection: `Create a self-reflection prompt for dream analysis about "${theme}". Make it thoughtful and introspective. Start directly with the prompt, no intro.`,
      incubation: `Create a dream incubation prompt about "${theme}" to help with dream recall and lucidity. Start directly with the prompt, no intro.`,
    };

    const systemPrompt = prompts[promptType];
    const result = await model.generateContent(systemPrompt);
    const generatedPrompt = result.response.text();

    console.log(
      "✅ Prompt generated:",
      generatedPrompt.substring(0, 100) + "..."
    );

    // Store in database
    const savedPrompt = await prisma.aIPrompt.create({
      data: {
        user_id: userId,
        user_input: `${promptType}: ${theme}`,
        ai_response: generatedPrompt,
      },
    });

    console.log("💾 Prompt saved to database:", savedPrompt.id);

    res.status(201).json({
      id: savedPrompt.id,
      type: promptType,
      theme: theme,
      content: generatedPrompt,
      createdAt: savedPrompt.timestamp,
    });
  } catch (error) {
    console.error("❌ Error generating prompt:", error);
    res.status(500).json({
      message: "Failed to generate prompt",
      error: error.message,
    });
  }
};

// @desc    Generate Affirmation
// @route   POST /api/ai/generate-affirmation
// @access  Private
exports.generateAffirmation = async (req, res) => {
  const { text } = req.body;
  const userId = req.userId;

  if (!text || !text.trim()) {
    return res.status(400).json({
      message: "Affirmation text is required",
    });
  }

  try {
    console.log("🤖 Generating affirmation with Gemini AI...");
    console.log("Input:", text.substring(0, 50) + "...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a sleep and lucid dreaming expert. Based on the following input, generate a powerful, positive affirmation for lucid dreaming and sleep improvement. The affirmation should be:
- Present tense and positive
- Short and memorable (1-2 sentences)
- Focused on awareness, control, and lucidity
- Easy to repeat before sleep

Input: "${text}"

Generate only the affirmation, no explanation.`;

    const result = await model.generateContent(systemPrompt);
    const generatedAffirmation = result.response.text();

    console.log("✅ Affirmation generated:", generatedAffirmation);

    // Store in database
    const savedAffirmation = await prisma.aIPrompt.create({
      data: {
        user_id: userId,
        user_input: `affirmation: ${text}`,
        ai_response: generatedAffirmation,
      },
    });

    console.log("💾 Affirmation saved to database:", savedAffirmation.id);

    res.status(201).json({
      id: savedAffirmation.id,
      type: "affirmation",
      inputText: text,
      affirmation: generatedAffirmation,
      createdAt: savedAffirmation.timestamp,
    });
  } catch (error) {
    console.error("❌ Error generating affirmation:", error);
    res.status(500).json({
      message: "Failed to generate affirmation",
      error: error.message,
    });
  }
};

// @desc    Get all AI prompts and affirmations for a user
// @route   GET /api/ai/history
// @access  Private
exports.getPromptHistory = async (req, res) => {
  const userId = req.userId;

  try {
    console.log("📋 Fetching prompt history for user:", userId);

    const prompts = await prisma.aIPrompt.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    console.log("✅ Retrieved", prompts.length, "prompts");

    // Transform the data
    const formattedPrompts = prompts.map((prompt) => {
      const isAffirmation = prompt.user_input.startsWith("affirmation:");
      const type = isAffirmation
        ? "affirmation"
        : prompt.user_input.split(":")[0];

      return {
        id: prompt.id,
        type: type,
        content: prompt.ai_response,
        inputText: prompt.user_input.replace(
          /^(affirmation:|creative:|reflection:|incubation:)\s*/i,
          ""
        ),
        createdAt: prompt.timestamp,
      };
    });

    res.status(200).json(formattedPrompts);
  } catch (error) {
    console.error("❌ Error fetching prompt history:", error);
    res.status(500).json({
      message: "Failed to fetch prompt history",
      error: error.message,
    });
  }
};

// @desc    Delete a prompt
// @route   DELETE /api/ai/prompts/:id
// @access  Private
exports.deletePrompt = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const prompt = await prisma.aIPrompt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }

    if (prompt.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this prompt" });
    }

    await prisma.aIPrompt.delete({
      where: { id: parseInt(id) },
    });

    console.log("🗑️  Prompt deleted:", id);

    res.status(200).json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting prompt:", error);
    res.status(500).json({
      message: "Failed to delete prompt",
      error: error.message,
    });
  }
};
