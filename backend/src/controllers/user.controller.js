const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Search for users by username
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
        id: {
          not: req.userId,
        },
      },
      select: {
        id: true,
        username: true,
        profile_picture_url: true,
      },
    });

    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      profile_picture_url: user.profile_picture_url || null,
    }));

    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message || "Database error",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:userId
// @access  Private
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if userId is in valid UUID format for Prisma
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      )
    ) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        profile_picture_url: true,
        bio: true,
        dreams: {
          where: { visibility: "public" },
          select: {
            id: true,
            content: true,
            timestamp: true,
            is_lucid: true,
            tags: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the response
    const userProfile = {
      id: user.id,
      username: user.username,
      profile_picture_url: user.profile_picture_url || null,
      bio: user.bio || null,
      dreams: user.dreams.map((dream) => ({
        id: dream.id,
        content: dream.content,
        timestamp: dream.timestamp,
        is_lucid: dream.is_lucid || false,
        tags: dream.tags || [],
      })),
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message || "Database error",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture_url: true,
        bio: true,
        reality_check_frequency: true,
        lucid_dream_goal: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWithPreferences = {
      ...user,
      preferences: {
        reality_check_frequency: user.reality_check_frequency,
        lucid_dream_goal: user.lucid_dream_goal,
      },
    };

    res.status(200).json(userWithPreferences);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message || "Database error",
    });
  }
};
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { username, bio, profile_picture_url } = req.body;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if username is already taken if changing username
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Only update fields that were provided
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profile_picture_url !== undefined)
      updateData.profile_picture_url = profile_picture_url;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        profile_picture_url: true,
        bio: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message || "Database error",
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  const { preferences } = req.body;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!preferences || typeof preferences !== "object") {
      return res
        .status(400)
        .json({ message: "Valid preferences object is required" });
    }

    // Extract specific preferences from the object that match your schema
    const updateData = {};
    if (preferences.reality_check_frequency !== undefined) {
      updateData.reality_check_frequency = preferences.reality_check_frequency;
    }
    if (preferences.lucid_dream_goal !== undefined) {
      updateData.lucid_dream_goal = preferences.lucid_dream_goal;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        reality_check_frequency: true,
        lucid_dream_goal: true,
      },
    });

    // Format the response to match the expected structure
    const response = {
      id: updatedUser.id,
      preferences: {
        reality_check_frequency: updatedUser.reality_check_frequency,
        lucid_dream_goal: updatedUser.lucid_dream_goal,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message || "Database error",
    });
  }
};
