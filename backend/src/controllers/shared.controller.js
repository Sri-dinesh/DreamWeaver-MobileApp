
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFriendDreams = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { following: true },
    });

    const friendIds = user.following.map((friend) => friend.id);

    const dreams = await prisma.dreamEntry.findMany({
      where: {
        user_id: { in: friendIds },
        visibility: { in: ["friends", "public"] },
      },
      include: { user: { select: { username: true, profile_picture_url: true } } },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(dreams);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getPublicDreams = async (req, res) => {
  try {
    const dreams = await prisma.dreamEntry.findMany({
      where: { visibility: "public" },
      include: { user: { select: { username: true, profile_picture_url: true } } },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json(dreams);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

module.exports = {
  getFriendDreams,
  getPublicDreams,
};
