
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadAudio = async (req, res) => {
    const { title, description } = req.body;
    const file_path = req.file ? `/audio/${req.file.filename}` : null;

    if (!file_path) {
        return res.status(400).json({ message: 'Audio file is required' });
    }

    try {
        const audio = await prisma.audio.create({
            data: {
                title,
                description,
                file_path,
                user: { connect: { id: req.userId } },
            },
        });
        res.status(201).json(audio);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

const getAudioCollection = async (req, res) => {
    try {
        const audioCollection = await prisma.audio.findMany({
            where: { user_id: req.userId },
            orderBy: { timestamp: 'desc' },
        });
        res.status(200).json(audioCollection);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

const addSampleAudio = async (req, res) => {
    try {
        const audio = await prisma.audio.create({
            data: {
                title: 'Sample Audio',
                description: 'This is a sample audio file.',
                file_path: '/audio/sample.mp3',
                user: { connect: { id: req.userId } },
            },
        });
        res.status(201).json(audio);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

module.exports = {
    uploadAudio,
    getAudioCollection,
    addSampleAudio,
};
