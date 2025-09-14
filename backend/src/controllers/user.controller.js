
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Search for users by username
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
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
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:userId
// @access  Private
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        profile_picture_url: true,
        bio: true,
        dreams: {
          where: { visibility: 'public' },
          select: {
            id: true,
            content: true,
            timestamp: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
