const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// @desc    Send a friend request
// @route   POST /api/friends/request/:receiverId
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.userId;

  try {
    // Validate inputs
    if (!receiverId || !senderId) {
      return res
        .status(400)
        .json({ message: "Sender and receiver IDs are required" });
    }

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a request already exists (both directions)
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          message: "A friend request already exists between you and this user",
        });
      }
      if (existingRequest.status === "accepted") {
        return res.status(400).json({
          message: "You are already friends with this user",
        });
      }
    }

    // Create friend request
    const request = await prisma.friendRequest.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Friend request sent successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:requestId
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.userId;

  try {
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the request
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the receiver
    if (request.receiver_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to accept this friend request",
      });
    }

    // Check if request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Friend request is already ${request.status}`,
      });
    }

    // Update request status and create mutual following relationship in transaction
    const result = await prisma.$transaction([
      // Update friend request status
      prisma.friendRequest.update({
        where: { id: parseInt(requestId) },
        data: { status: "accepted" },
      }),
      // Make receiver follow sender
      prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            connect: { id: request.sender_id },
          },
        },
      }),
      // Make sender follow receiver
      prisma.user.update({
        where: { id: request.sender_id },
        data: {
          following: {
            connect: { id: userId },
          },
        },
      }),
    ]);

    res.status(200).json({
      message: "Friend request accepted successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Reject a friend request
// @route   POST /api/friends/reject/:requestId
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.userId;

  try {
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the request
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the receiver
    if (request.receiver_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to reject this friend request",
      });
    }

    // Check if request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Friend request is already ${request.status}`,
      });
    }

    // Update request status to rejected
    const rejectedRequest = await prisma.friendRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: "rejected" },
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

    res.status(200).json({
      message: "Friend request rejected successfully",
      data: rejectedRequest,
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Cancel a sent friend request
// @route   DELETE /api/friends/request/:requestId
// @access  Private
exports.cancelFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.userId;

  try {
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the request
    const request = await prisma.friendRequest.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the sender
    if (request.sender_id !== userId) {
      return res.status(403).json({
        message: "You can only cancel your own friend requests",
      });
    }

    // Check if request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending friend requests can be cancelled",
      });
    }

    // Delete the friend request
    await prisma.friendRequest.delete({
      where: { id: parseInt(requestId) },
    });

    res.status(200).json({
      message: "Friend request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get all friends for the logged-in user
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all accepted friend requests where user is either sender or receiver
    const friendships = await prisma.friendRequest.findMany({
      where: {
        AND: [
          { status: "accepted" },
          {
            OR: [{ sender_id: userId }, { receiver_id: userId }],
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
            bio: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profile_picture_url: true,
            bio: true,
          },
        },
      },
    });

    // Extract friend objects (the other person in each friendship)
    const friends = friendships.map((friendship) => {
      return friendship.sender_id === userId
        ? friendship.receiver
        : friendship.sender;
    });

    res.status(200).json({
      message: "Friends retrieved successfully",
      count: friends.length,
      data: friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get all sent friend requests for the logged-in user
// @route   GET /api/friends/requests/sent
// @access  Private
exports.getSentFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await prisma.friendRequest.findMany({
      where: {
        sender_id: userId,
        status: "pending",
      },
      include: {
        receiver: {
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

    res.status(200).json({
      message: "Sent friend requests retrieved successfully",
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Get all received friend requests for the logged-in user
// @route   GET /api/friends/requests/received
// @access  Private
exports.getReceivedFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await prisma.friendRequest.findMany({
      where: {
        receiver_id: userId,
        status: "pending",
      },
      include: {
        sender: {
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

    res.status(200).json({
      message: "Received friend requests retrieved successfully",
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching received friend requests:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// @desc    Check friend status between two users
// @route   GET /api/friends/status/:otherUserId
// @access  Private
exports.checkFriendStatus = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.userId;

  try {
    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    if (userId === otherUserId) {
      return res
        .status(400)
        .json({ message: "Cannot check friend status with yourself" });
    }

    // Check for any relationship between the two users
    const relationship = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId },
        ],
      },
    });

    if (!relationship) {
      return res.status(200).json({
        status: "none",
        message: "No friend relationship exists",
      });
    }

    // Determine the relationship status
    let status = relationship.status;
    let isOutgoing = relationship.sender_id === userId;

    res.status(200).json({
      status,
      isOutgoing,
      message: `Friend status: ${status}${
        isOutgoing ? " (outgoing request)" : " (incoming request)"
      }`,
    });
  } catch (error) {
    console.error("Error checking friend status:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
