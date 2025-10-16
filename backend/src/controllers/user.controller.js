const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Search for users by username
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profile_picture_url: true,
      },
      take: 20,
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// @desc    Get all users (for discovery/finding friends)
// @route   GET /api/users/discover
// @access  Private
exports.discoverUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { search = "" } = req.query;

    console.log("Discovering users for:", currentUserId);
    console.log("Search query:", search);

    // Get all users except the current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          search
            ? {
                OR: [
                  { username: { contains: search, mode: "insensitive" } },
                  { bio: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profile_picture_url: true,
        following: {
          select: { id: true },
        },
        followedBy: {
          select: { id: true },
        },
      },
      orderBy: { id: "desc" },
      take: 50,
    });

    console.log("Found users:", users.length);

    // Format response to include friendship status
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      bio: user.bio || null,
      profilePicture: user.profile_picture_url || null,
      isFriend: user.followedBy.some((f) => f.id === currentUserId),
      isFollowing: user.following.some((f) => f.id === currentUserId),
    }));

    console.log("Formatted users:", formattedUsers.length);

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error discovering users:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// @desc    Get a single user profile by ID
// @route   GET /api/users/:userId
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    console.log(
      "Fetching user profile:",
      userId,
      "for current user:",
      currentUserId
    );

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        profile_picture_url: true,
        following: {
          select: { id: true },
        },
        followedBy: {
          select: { id: true },
        },
        dreams: {
          where: { visibility: "public" },
          select: {
            id: true,
            title: true,
            content: true,
            timestamp: true,
            emotion: true,
            is_lucid: true,
          },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.username);

    const formattedUser = {
      id: user.id,
      username: user.username,
      bio: user.bio || null,
      profilePicture: user.profile_picture_url || null,
      stats: {
        followers: user.followedBy.length,
        following: user.following.length,
        publicDreams: user.dreams.length,
      },
      isFriend: user.followedBy.some((f) => f.id === currentUserId),
      isFollowing: user.following.some((f) => f.id === currentUserId),
      isOwnProfile: userId === currentUserId,
      recentDreams: user.dreams.map((dream) => ({
        id: dream.id.toString(),
        title: dream.title || "Untitled Dream",
        content: dream.content,
        createdAt: dream.timestamp.toISOString(),
        emotion: dream.emotion,
        lucid: dream.is_lucid,
      })),
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profile_picture_url: true,
        following: {
          select: { id: true },
        },
        followedBy: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, bio, profile_picture_url } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(bio && { bio }),
        ...(profile_picture_url && { profile_picture_url }),
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profile_picture_url: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { reality_check_frequency, lucid_dream_goal } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(reality_check_frequency && { reality_check_frequency }),
        ...(lucid_dream_goal && { lucid_dream_goal }),
      },
      select: {
        id: true,
        username: true,
        reality_check_frequency: true,
        lucid_dream_goal: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
