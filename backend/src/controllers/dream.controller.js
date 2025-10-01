const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper function to handle tags
const getTagIds = async (tags) => {
  try {
    if (!Array.isArray(tags)) {
      throw new Error("Tags must be an array");
    }

    const tagIds = [];
    for (const tagName of tags) {
      if (!tagName || typeof tagName !== "string") {
        continue; // Skip invalid tags
      }

      const normalizedName = tagName.toLowerCase().trim();
      if (!normalizedName) continue;

      let tag = await prisma.tag.findUnique({
        where: { name: normalizedName },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: normalizedName },
        });
      }

      tagIds.push({ id: tag.id });
    }
    return tagIds;
  } catch (error) {
    console.error("Error processing tags:", error);
    return [];
  }
};

// @desc    Get all dreams for a user
// @route   GET /api/dreams
// @access  Private
exports.getDreams = async (req, res) => {
  try {
    // Validate user ID
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const dreams = await prisma.dreamEntry.findMany({
      where: { user_id: req.userId },
      include: {
        tags: {
          select: { id: true, name: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(dreams);
  } catch (error) {
    console.error("Error fetching dreams:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get a single dream
// @route   GET /api/dreams/:id
// @access  Private
exports.getDreamById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if id is valid
    const dreamId = parseInt(id);
    if (isNaN(dreamId)) {
      return res.status(400).json({ message: "Valid ID is required" });
    }

    const dream = await prisma.dreamEntry.findUnique({
      where: { id: dreamId },
      include: {
        tags: {
          select: { id: true, name: true },
        },
      },
    });

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    res.status(200).json(dream);
  } catch (error) {
    console.error("Error fetching dream by ID:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Create a new dream
// @route   POST /api/dreams
// @access  Private
exports.createDream = async (req, res) => {
  const { content, is_lucid, emotion, visibility, tags } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const tagIds = tags && tags.length > 0 ? await getTagIds(tags) : [];

    // Convert is_lucid to proper boolean
    const isLucidBoolean =
      is_lucid === true || is_lucid === "true" || is_lucid === "yes"
        ? true
        : false;

    const dream = await prisma.dreamEntry.create({
      data: {
        content,
        is_lucid: isLucidBoolean,
        emotion: emotion || null,
        visibility: visibility || "private",
        user_id: req.userId,
        tags: { connect: tagIds },
      },
      include: { tags: true },
    });

    if (!dream) {
      return res.status(500).json({ message: "Failed to create dream entry" });
    }

    res.status(201).json(dream);
  } catch (error) {
    console.error("Dream creation error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Update a dream
// @route   PUT /api/dreams/:id
// @access  Private
exports.updateDream = async (req, res) => {
  const { id } = req.params;
  const { content, is_lucid, emotion, visibility, tags } = req.body;

  try {
    // Check if id is valid
    const dreamId = parseInt(id);
    if (isNaN(dreamId)) {
      return res.status(400).json({ message: "Valid ID is required" });
    }

    const dream = await prisma.dreamEntry.findUnique({
      where: { id: dreamId },
      include: { tags: true },
    });

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Handle tag updates
    let tagIds = [];
    if (tags && tags.length > 0) {
      tagIds = await getTagIds(tags);
    }

    // Convert is_lucid to proper boolean if provided
    let isLucidValue;
    if (is_lucid !== undefined) {
      isLucidValue =
        is_lucid === true ||
        is_lucid === "true" ||
        is_lucid === "yes" ||
        is_lucid === 1 ||
        is_lucid === "1";
    }

    // First disconnect all existing tags if we're updating tags
    if (tags !== undefined) {
      await prisma.dreamEntry.update({
        where: { id: dreamId },
        data: {
          tags: { disconnect: dream.tags.map((tag) => ({ id: tag.id })) },
        },
      });
    }

    // Then update dream with new data and connect new tags
    const updateData = {};

    if (content !== undefined) updateData.content = content;
    if (is_lucid !== undefined) updateData.is_lucid = isLucidValue;
    if (emotion !== undefined) updateData.emotion = emotion;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (tags !== undefined && tagIds.length > 0) {
      updateData.tags = { connect: tagIds };
    }

    const updatedDream = await prisma.dreamEntry.update({
      where: { id: dreamId },
      data: updateData,
      include: { tags: true },
    });

    res.status(200).json(updatedDream);
  } catch (error) {
    console.error("Dream update error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Delete a dream
// @route   DELETE /api/dreams/:id
// @access  Private
exports.deleteDream = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if id is valid
    const dreamId = parseInt(id);
    if (isNaN(dreamId)) {
      return res.status(400).json({ message: "Valid ID is required" });
    }

    const dream = await prisma.dreamEntry.findUnique({
      where: { id: dreamId },
      include: { tags: true },
    });

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // First disconnect all tags to prevent reference constraints
    if (dream.tags.length > 0) {
      await prisma.dreamEntry.update({
        where: { id: dreamId },
        data: {
          tags: { disconnect: dream.tags.map((tag) => ({ id: tag.id })) },
        },
      });
    }

    // Then delete the dream
    await prisma.dreamEntry.delete({
      where: { id: dreamId },
    });

    res.status(200).json({ message: "Dream deleted successfully" });
  } catch (error) {
    console.error("Dream deletion error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeDream = async (req, res) => {
  const { id } = req.params;

  try {
    const dreamId = parseInt(id);
    if (isNaN(dreamId)) {
      return res.status(400).json({ message: "Valid ID is required" });
    }

    const dream = await prisma.dreamEntry.findUnique({
      where: { id: dreamId },
    });

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the following dream and provide insights into its possible meanings, symbols, and emotional themes: "${dream.content}"`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      res.status(200).json({ analysis });
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      res.status(500).json({
        message: "Error analyzing dream",
        error: aiError.message || "AI service unavailable",
      });
    }
  } catch (error) {
    console.error("Dream analysis error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.searchDreams = async (req, res) => {
  const { content, tags, fromDate, toDate, isLucid } = req.body;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const where = { user_id: req.userId };

    if (content) {
      where.content = { contains: content, mode: "insensitive" };
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Normalize tags to lowercase for case-insensitive search
      const normalizedTags = tags
        .map((tag) => tag.toLowerCase().trim())
        .filter(Boolean);
      if (normalizedTags.length > 0) {
        where.tags = {
          some: {
            name: { in: normalizedTags },
          },
        };
      }
    }

    // Handle date range properly
    if (fromDate || toDate) {
      where.timestamp = {};

      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }

      if (toDate) {
        where.timestamp.lte = new Date(toDate);
      }
    }

    // Convert isLucid to proper boolean if provided
    if (isLucid !== undefined) {
      where.is_lucid =
        isLucid === true ||
        isLucid === "true" ||
        isLucid === "yes" ||
        isLucid === 1 ||
        isLucid === "1";
    }

    const dreams = await prisma.dreamEntry.findMany({
      where,
      include: {
        tags: {
          select: { id: true, name: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(dreams);
  } catch (error) {
    console.error("Dream search error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
