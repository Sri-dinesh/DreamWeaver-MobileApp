
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLucidDreamStatistics = async (req, res) => {
    try {
        const totalDreams = await prisma.dreamEntry.count({
            where: { user_id: req.userId },
        });

        const lucidDreams = await prisma.dreamEntry.count({
            where: { user_id: req.userId, is_lucid: true },
        });

        const lucidDreamRatio = totalDreams > 0 ? (lucidDreams / totalDreams) * 100 : 0;

        res.status(200).json({ totalDreams, lucidDreams, lucidDreamRatio });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
