const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get a specific shared dream by ID
// @route   GET /api/shared/:id
// @access  Private
exports.getSharedDreamById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const dreamId = parseInt(id);
    if (isNaN(dreamId)) {
      return res.status(400).json({ message: 'Valid ID is required' });
    }

    const dream = await prisma.dreamEntry.findUnique({
      where: { id: dreamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            profile_picture_url: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!dream) {
      return res.status(404).json({ message: 'Dream not found' });
    }

    // If it's the user's own dream, allow access
    if (dream.user_id === userId) {
      return res.status(200).json(dream);
    }

    // If dream is public, allow access
    if (dream.visibility === 'public') {
      return res.status(200).json(dream);
    }

    // If dream is friends-only, check if user is a friend
    if (dream.visibility === 'friends') {
      const isFriend = await prisma.friendRequest.findFirst({
        where: {
          status: 'accepted',
          OR: [
            { sender_id: userId, receiver_id: dream.user_id },
            { sender_id: dream.user_id, receiver_id: userId },
          ],
        },
      });

      if (isFriend) {
        return res.status(200).json(dream);
      }
    }

    // If dream is private or user doesn't have access
    return res.status(403).json({ message: 'You do not have permission to view this dream' });
  } catch (error) {
    console.error('❌ Error fetching shared dream:', error);
    res.status(500).json({
      message: 'Failed to fetch dream',
      error: error.message,
    });
  }
};

// @desc    Get all public and friends-only dreams
// @route   GET /api/shared
// @access  Private
exports.getSharedDreams = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('📋 Fetching shared dreams for user:', userId);

    // Get all friends of current user
    const friendships = await prisma.friendRequest.findMany({
      where: {
        AND: [
          { status: 'accepted' },
          {
            OR: [
              { sender_id: userId },
              { receiver_id: userId },
            ],
          },
        ],
      },
      select: {
        sender_id: true,
        receiver_id: true,
      },
    });

    // Extract friend IDs
    const friendIds = friendships.map((friendship) => {
      return friendship.sender_id === userId 
        ? friendship.receiver_id 
        : friendship.sender_id;
    });

    console.log('👥 Friends:', friendIds);

    // Get dreams that are either:
    // 1. Public (visibility = 'public')
    // 2. Friends-only AND shared by a friend (visibility = 'friends' AND author is a friend)
    const dreams = await prisma.dreamEntry.findMany({
      where: {
        OR: [
          // Public dreams from anyone
          { visibility: 'public' },
          // Friends-only dreams from friends
          {
            AND: [
              { visibility: 'friends' },
              { user_id: { in: friendIds } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            profile_picture_url: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    console.log('✅ Shared dreams fetched:', dreams.length);

    // Transform data for frontend
    const transformedDreams = dreams.map((dream) => ({
      id: dream.id,
      title: dream.title || 'Untitled Dream',
      content: dream.content,
      visibility: dream.visibility,
      lucid: dream.is_lucid,
      emotion: dream.emotion,
      createdAt: dream.timestamp,
      likes: 0,
      comments: 0,
      tags: dream.tags || [],
      author: {
        id: dream.user.id,
        name: dream.user.username,
        bio: dream.user.bio,
        avatar: dream.user.profile_picture_url,
      },
    }));

    res.status(200).json(transformedDreams);
  } catch (error) {
    console.error('❌ Error fetching shared dreams:', error);
    res.status(500).json({
      message: 'Failed to fetch shared dreams',
      error: error.message,
    });
  }
};