
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.updateRealityCheckSettings = async (req, res) => {
    const { enabled, frequency } = req.body;

    try {
        const settings = await prisma.lucidTrainerSetting.upsert({
            where: { user_id: req.userId },
            update: { reality_check_enabled: enabled, rc_frequency: frequency },
            create: { user_id: req.userId, reality_check_enabled: enabled, rc_frequency: frequency },
        });
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.testRealityCheckNotification = async (req, res) => {
    // In a real application, this would trigger a push notification.
    res.status(200).json({ message: 'Test notification sent successfully!' });
};

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

exports.getGuidedTechniques = async (req, res) => {
    const techniques = {
        mild: {
            title: 'MILD (Mnemonic Induction of Lucid Dreams)',
            description: 'This technique involves repeatedly telling yourself that you will remember to recognize you\'re dreaming while falling asleep, combined with vivid visualization of becoming lucid in a dream.',
            steps: [
                'Before bed, set an intention to remember your dreams.',
                'Wake up after 4-6 hours of sleep (e.g., using an alarm).',
                'Recall your most recent dream. If you can\'t, think about anything.',
                `As you fall back asleep, repeatedly tell yourself: "Next time I\'m dreaming, I will remember that I\'m dreaming." `,
                `Visualize yourself becoming lucid in the dream you just woke from. Imagine performing a reality check and realizing you\'re dreaming.`,
                'Continue until you fall asleep.',
            ],
        },
        wild: {
            title: 'WILD (Wake Initiated Lucid Dreams)',
            description: 'WILD involves going directly from a waking state into a dream without losing consciousness. This often involves experiencing hypnagogic imagery and sensations.',
            steps: [
                'Lie still in bed, focusing on your breath or a simple image.',
                'Relax your body completely. Avoid moving.',
                'Pay attention to hypnagogic imagery (visuals or sounds) that arise.',
                `Let yourself drift, but maintain a sliver of awareness. The goal is to transition directly into a dream.`,
                'If successful, you will enter a dream fully aware.',
            ],
        },
        dots: {
            title: 'DOTS (Dreaming on The Spot)',
            description: `A straightforward technique where you simply decide to have a lucid dream just before falling asleep, and then focus on that intention as you drift off.`,
            steps: [
                'Lie down comfortably.',
                `Close your eyes and affirm: "I will have a lucid dream tonight." `,
                'Concentrate purely on the intention of becoming lucid, without trying too hard or straining.',
                'Allow yourself to fall asleep naturally while holding this intention.',
            ],
        },
    };

    res.status(200).json(techniques);
};
