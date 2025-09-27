const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

// @desc    Get all dream art for a user
// @route   GET /api/dreamart
// @access  Private
exports.getDreamArt = async (req, res) => {
  try {
    const art = await prisma.dreamArt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(art);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Upload a new dream art
// @route   POST /api/dreamart
// @access  Private
exports.uploadDreamArt = async (req, res) => {
  const { prompt, description } = req.body;
  const image_url = req.file ? `/images/${req.file.filename}` : null;

  if (!prompt || !image_url) {
    return res.status(400).json({ message: "Prompt and image are required" });
  }

  try {
    const art = await prisma.dreamArt.create({
      data: {
        prompt,
        description,
        image_url,
        user: { connect: { id: req.userId } },
      },
    });
    res.status(201).json(art);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Delete a dream art
// @route   DELETE /api/dreamart/:id
// @access  Private
exports.deleteDreamArt = async (req, res) => {
  const { id } = req.params;

  try {
    const art = await prisma.dreamArt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!art) {
      return res.status(404).json({ message: "Dream art not found" });
    }

    if (art.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, `../../public${art.image_url}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.dreamArt.delete({
      where: { id: parseInt(id) },
    });

    res.status(500).json({ message: "Something went wrong", error });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

exports.generateDreamArt = async (req, res) => {
  res
    .status(200)
    .json({ message: "AI dream art generation will be available soon." });
};
