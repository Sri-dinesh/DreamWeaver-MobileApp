const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ttsService = require("../services/ttsService");
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
    console.error("Error fetching prompts:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Create a new AI prompt
// @route   POST /api/ai/prompts
// @access  Private
exports.createAIPrompt = async (req, res) => {
  const { user_input, promptType } = req.body;

  if (!user_input || !promptType) {
    return res
      .status(400)
      .json({ message: "user_input and promptType are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a creative assistant. Generate a ${promptType} prompt based on the following input: ${user_input}`;
    const result = await model.generateContent(prompt);
    const ai_response = result.response.text().trim();

    const newPrompt = await prisma.aIPrompt.create({
      data: {
        user_id: req.userId,
        user_input: user_input,
        ai_response: ai_response,
      },
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

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
    console.error("Error deleting prompt:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get all audio prompts for a user
// @route   GET /api/ai/audio-prompts
// @access  Private
exports.getAudioPrompts = async (req, res) => {
  try {
    const prompts = await prisma.audioPrompt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(prompts);
  } catch (error) {
    console.error("Error fetching audio prompts:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Generate Affirmation with Audio
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
    const generatedAffirmation = result.response.text().trim();

    console.log("✅ Affirmation generated:", generatedAffirmation);

    // Convert to speech
    console.log("🎤 Converting affirmation to speech...");
    let audioData = null;

    try {
      audioData = await ttsService.convertTextToSpeech(
        generatedAffirmation,
        userId,
        "affirmation"
      );
      console.log("✅ Audio generated and uploaded:", audioData.audioUrl);
    } catch (ttsError) {
      console.error("⚠️  TTS conversion failed:", ttsError.message);
      console.log("⚠️  Continuing without audio...");
      audioData = null;
    }

    // Store in database - AIPrompt model (matches schema)
    const savedAffirmation = await prisma.aIPrompt.create({
      data: {
        user_id: userId,
        user_input: text,
        ai_response: generatedAffirmation,
      },
    });

    console.log("💾 Affirmation saved to database:", savedAffirmation.id);

    // If audio was generated, create AudioPrompt record (matches schema)
    if (audioData) {
      try {
        await prisma.audioPrompt.create({
          data: {
            user_id: userId,
            original_text: generatedAffirmation,
            file_path: audioData.audioUrl, // Store the public URL
            description: "Generated affirmation audio",
            ai_prompt_id: savedAffirmation.id,
            timestamp: new Date(),
          },
        });
        console.log("💾 Audio record saved to database");
      } catch (audioError) {
        console.error("⚠️  Error saving audio record:", audioError.message);
      }
    }

    res.status(201).json({
      id: savedAffirmation.id,
      type: "affirmation",
      inputText: text,
      affirmation: generatedAffirmation,
      audioUrl: audioData?.audioUrl || null, // ✅ This is the full Supabase URL
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

// @desc    Generate Prompt with Audio
// @route   POST /api/ai/generate-prompt
// @access  Private
exports.generatePrompt = async (req, res) => {
  const { promptType, theme } = req.body;
  const userId = req.userId;

  if (!theme || !theme.trim()) {
    return res.status(400).json({ message: "Theme is required" });
  }

  try {
    console.log("🤖 Generating prompt with Gemini AI...");
    console.log("Type:", promptType, "Theme:", theme);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemPrompt;

    if (promptType === "creative") {
      systemPrompt = `You are a dream expert. Create a creative writing prompt for lucid dreaming based on this theme: "${theme}". The prompt should be inspiring, vivid, and encourage imagination. Keep it to 2-3 sentences.`;
    } else if (promptType === "reflection") {
      systemPrompt = `You are a psychologist specializing in dreams. Create a self-reflection prompt to explore the theme "${theme}" in dreams. Ask thought-provoking questions to help dream recall and analysis. Keep it to 2-3 sentences.`;
    } else if (promptType === "incubation") {
      systemPrompt = `You are a lucid dreaming coach. Create a dream incubation prompt using the theme "${theme}". This should be a clear intention-setting statement for sleep. Keep it to 1-2 sentences and make it actionable.`;
    }

    const result = await model.generateContent(systemPrompt);
    const generatedPrompt = result.response.text().trim();

    console.log("✅ Prompt generated:", generatedPrompt);

    // Convert to speech
    console.log("🎤 Converting prompt to speech...");
    let audioData = null;

    try {
      audioData = await ttsService.convertTextToSpeech(
        generatedPrompt,
        userId,
        promptType
      );
      console.log("✅ Audio generated and uploaded:", audioData.audioUrl);
    } catch (ttsError) {
      console.error("⚠️  TTS conversion failed:", ttsError.message);
      console.log("⚠️  Continuing without audio...");
      audioData = null;
    }

    // Store in database - AIPrompt model
    const savedPrompt = await prisma.aIPrompt.create({
      data: {
        user_id: userId,
        user_input: `${promptType}: ${theme}`,
        ai_response: generatedPrompt,
      },
    });

    console.log("💾 Prompt saved to database:", savedPrompt.id);

    // If audio was generated, create AudioPrompt record
    if (audioData) {
      try {
        await prisma.audioPrompt.create({
          data: {
            user_id: userId,
            original_text: generatedPrompt,
            file_path: audioData.audioUrl,
            description: `Generated ${promptType} prompt audio`,
            ai_prompt_id: savedPrompt.id,
            timestamp: new Date(),
          },
        });
        console.log("💾 Audio record saved to database");
      } catch (audioError) {
        console.error("⚠️  Error saving audio record:", audioError.message);
      }
    }

    res.status(201).json({
      id: savedPrompt.id,
      type: promptType,
      inputText: theme,
      content: generatedPrompt,
      audioUrl: audioData?.audioUrl || null,
      timestamp: savedPrompt.timestamp,
    });
  } catch (error) {
    console.error("❌ Error generating prompt:", error);
    res.status(500).json({
      message: "Failed to generate prompt",
      error: error.message,
    });
  }
};

// @desc    Get prompt history
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

    // Get associated audio files with full URLs
    const audioPrompts = await prisma.audioPrompt.findMany({
      where: { user_id: userId },
    });

    const audioMap = {};
    audioPrompts.forEach((audio) => {
      // audio.file_path should already be the full Supabase URL
      audioMap[audio.ai_prompt_id] = audio.file_path;
    });

    // Transform the data
    const formattedPrompts = prompts.map((prompt) => {
      const parts = prompt.user_input.split(":");
      const type = parts[0] || "affirmation";
      const inputText = parts.slice(1).join(":").trim();

      const audioUrl = audioMap[prompt.id];
      console.log(`📝 Prompt ${prompt.id} audio URL:`, audioUrl);

      return {
        id: prompt.id,
        type: type,
        content: prompt.ai_response,
        inputText: inputText || prompt.user_input,
        audioUrl: audioUrl || null,
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

// @desc    Delete a prompt and its audio
// @route   DELETE /api/ai/history/:id
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

    // Get associated audio files and delete them
    const audioPrompts = await prisma.audioPrompt.findMany({
      where: { ai_prompt_id: parseInt(id) },
    });

    for (const audio of audioPrompts) {
      try {
        await ttsService.deleteAudioFile(audio.file_path);
        console.log("✅ Audio file deleted:", audio.file_path);
      } catch (error) {
        console.error("⚠️  Error deleting audio file:", error);
      }
    }

    // Delete audio prompt records
    await prisma.audioPrompt.deleteMany({
      where: { ai_prompt_id: parseInt(id) },
    });

    // Delete the main prompt
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
