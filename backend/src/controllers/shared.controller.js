const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Get all public dreams
// @route   GET /api/shared
// @access  Private (must be logged in to see public dreams)
exports.getPublicDreams = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find all dreams with 'public' visibility
    const publicDreams = await prisma.dreamEntry.findMany({
      where: { visibility: "public" },
      include: {
        tags: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
            bio: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    // Format the response to match the frontend SharedDream structure
    const formattedDreams = publicDreams.map((dream) => ({
      id: dream.id.toString(),
      title: dream.title || undefined,
      content: dream.content,
      createdAt: dream.timestamp.toISOString(),
      updatedAt: dream.updated_at?.toISOString(),
      likes: dream.like_count || 0,
      comments: dream.comment_count || 0,
      visibility: dream.visibility,
      emotion: dream.emotion,
      lucid: dream.is_lucid,
      tags: dream.tags,
      author: {
        id: dream.user.id,
        name: dream.user.username,
        username: dream.user.username,
        profilePicture: dream.user.profile_picture_url,
        bio: dream.user.bio,
      },
    }));

    res.status(200).json(formattedDreams);
  } catch (error) {
    console.error("Error fetching public dreams:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get details of a single shared dream
// @route   GET /api/shared/:id
// @access  Private (user must be logged in)
exports.getSharedDreamById = async (req, res) => {
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
        user: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
            bio: true,
          },
        },
      },
    });

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    // Only return the dream if it's public or belongs to the requesting user
    if (dream.visibility !== "public" && dream.user_id !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this dream" });
    }

    // Format the response
    const formattedDream = {
      id: dream.id.toString(),
      title: dream.title || undefined,
      content: dream.content,
      createdAt: dream.timestamp.toISOString(),
      updatedAt: dream.updated_at?.toISOString(),
      likes: dream.like_count || 0,
      comments: dream.comment_count || 0,
      visibility: dream.visibility,
      emotion: dream.emotion,
      lucid: dream.is_lucid,
      tags: dream.tags,
      author: {
        id: dream.user.id,
        name: dream.user.username,
        username: dream.user.username,
        profilePicture: dream.user.profile_picture_url,
        bio: dream.user.bio,
      },
      isLiked: false,
      isSaved: false,
    };

    res.status(200).json(formattedDream);
  } catch (error) {
    console.error("Error fetching shared dream:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
