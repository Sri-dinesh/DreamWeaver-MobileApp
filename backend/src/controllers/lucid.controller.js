
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get lucid trainer settings for a user
// @route   GET /api/lucid/settings
// @access  Private
exports.getLucidSettings = async (req, res) => {
  try {
    const settings = await prisma.lucidTrainerSetting.findUnique({
      where: { user_id: req.userId },
    });

    if (!settings) {
      // If no settings exist, create them with default values
      const newSettings = await prisma.lucidTrainerSetting.create({
        data: {
          user: { connect: { id: req.userId } },
        },
      });
      return res.status(200).json(newSettings);
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Update lucid trainer settings for a user
// @route   PUT /api/lucid/settings
// @access  Private
exports.updateLucidSettings = async (req, res) => {
  const { reality_check_time, rc_frequency, rc_method } = req.body;

  try {
    const settings = await prisma.lucidTrainerSetting.update({
      where: { user_id: req.userId },
      data: {
        reality_check_time: reality_check_time ? new Date(reality_check_time) : null,
        rc_frequency,
        rc_method,
      },
    });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
