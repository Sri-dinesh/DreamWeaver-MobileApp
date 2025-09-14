
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to handle tags
const getTagIds = async (tags) => {
  const tagIds = [];
  for (const tagName of tags) {
    let tag = await prisma.tag.findUnique({
      where: { name: tagName.toLowerCase() },
    });
    if (!tag) {
      tag = await prisma.tag.create({
        data: { name: tagName.toLowerCase() },
      });
    }
    tagIds.push({ id: tag.id });
  }
  return tagIds;
};

// @desc    Get all dreams for a user
// @route   GET /api/dreams
// @access  Private
exports.getDreams = async (req, res) => {
  try {
    const dreams = await prisma.dreamEntry.findMany({
      where: { user_id: req.userId },
      include: { tags: true },
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(dreams);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Get a single dream
// @route   GET /api/dreams/:id
// @access  Private
exports.getDreamById = async (req, res) => {
  const { id } = req.params;
  try {
    const dream = await prisma.dreamEntry.findUnique({
      where: { id: parseInt(id) },
      include: { tags: true },
    });

    if (!dream) {
      return res.status(404).json({ message: 'Dream not found' });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    res.status(200).json(dream);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Create a new dream
// @route   POST /api/dreams
// @access  Private
exports.createDream = async (req, res) => {
  const { content, is_lucid, emotion, visibility, tags } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const tagIds = tags && tags.length > 0 ? await getTagIds(tags) : [];

    const dream = await prisma.dreamEntry.create({
      data: {
        content,
        is_lucid,
        emotion,
        visibility,
        user: { connect: { id: req.userId } },
        tags: { connect: tagIds },
      },
    });
    res.status(201).json(dream);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Update a dream
// @route   PUT /api/dreams/:id
// @access  Private
exports.updateDream = async (req, res) => {
  const { id } = req.params;
  const { content, is_lucid, emotion, visibility, tags } = req.body;

  try {
    const dream = await prisma.dreamEntry.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dream) {
      return res.status(404).json({ message: 'Dream not found' });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    const tagIds = tags && tags.length > 0 ? await getTagIds(tags) : [];

    const updatedDream = await prisma.dreamEntry.update({
      where: { id: parseInt(id) },
      data: {
        content,
        is_lucid,
        emotion,
        visibility,
        tags: { set: tagIds },
      },
    });

    res.status(200).json(updatedDream);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Delete a dream
// @route   DELETE /api/dreams/:id
// @access  Private
exports.deleteDream = async (req, res) => {
  const { id } = req.params;

  try {
    const dream = await prisma.dreamEntry.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dream) {
      return res.status(404).json({ message: 'Dream not found' });
    }

    if (dream.user_id !== req.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await prisma.dreamEntry.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Dream deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
