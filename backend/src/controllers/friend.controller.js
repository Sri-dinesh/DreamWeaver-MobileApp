
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Send a friend request
// @route   POST /api/friends/request/:receiverId
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.userId;

  if (parseInt(receiverId) === senderId) {
    return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
  }

  try {
    // Check if a request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { sender_id: senderId, receiver_id: parseInt(receiverId) },
          { sender_id: parseInt(receiverId), receiver_id: senderId },
        ],
      },
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent or received' });
    }

    const request = await prisma.friendRequest.create({
      data: {
        sender_id: senderId,
        receiver_id: parseInt(receiverId),
      },
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:requestId
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.userId;

  try {
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request || request.receiver_id !== userId) {
      return res.status(404).json({ message: 'Friend request not found or you are not the receiver' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: parseInt(requestId) },
        data: { status: 'accepted' },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            connect: { id: request.sender_id },
          },
        },
      }),
      prisma.user.update({
        where: { id: request.sender_id },
        data: {
          following: {
            connect: { id: userId },
          },
        },
      }),
    ]);

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Reject a friend request
// @route   POST /api/friends/reject/:requestId
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.userId;

  try {
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request || request.receiver_id !== userId) {
      return res.status(404).json({ message: 'Friend request not found or you are not the receiver' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    await prisma.friendRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: 'rejected' },
    });

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Get all friends for the logged-in user
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
          },
        },
      },
    });

    const friends = user.following.filter(async (followingUser) => {
      const isFriend = await prisma.user.findFirst({
        where: {
          id: followingUser.id,
          following: {
            some: {
              id: req.userId,
            },
          },
        },
      });
      return isFriend;
    });

    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Get all sent friend requests for the logged-in user
// @route   GET /api/friends/requests/sent
// @access  Private
exports.getSentFriendRequests = async (req, res) => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        sender_id: req.userId,
        status: 'pending',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
          },
        },
      },
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Get all received friend requests for the logged-in user
// @route   GET /api/friends/requests/received
// @access  Private
exports.getReceivedFriendRequests = async (req, res) => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiver_id: req.userId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
          },
        },
      },
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
