
const getFriendDreams = async (req, res) => {
    res.status(200).json({ message: 'Friend dreams will be available soon.' });
};

const getPublicDreams = async (req, res) => {
    res.status(200).json({ message: 'Public dreams will be available soon.' });
};

module.exports = {
    getFriendDreams,
    getPublicDreams,
};
