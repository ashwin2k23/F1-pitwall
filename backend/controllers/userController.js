const { users } = require('./authController');

exports.getPreferences = async (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ id: user.id, email: user.email, favoriteTeam: user.favoriteTeam, favoriteDriver: user.favoriteDriver, preferences: user.preferences });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updatePreferences = async (req, res) => {
    const { favoriteTeam, favoriteDriver, preferences } = req.body;
    try {
        const userIndex = users.findIndex(u => u.id === req.user.id);
        if (userIndex === -1) return res.status(404).json({ msg: 'User not found' });

        users[userIndex] = {
            ...users[userIndex],
            favoriteTeam: favoriteTeam !== undefined ? favoriteTeam : users[userIndex].favoriteTeam,
            favoriteDriver: favoriteDriver !== undefined ? favoriteDriver : users[userIndex].favoriteDriver,
            preferences: { ...users[userIndex].preferences, ...preferences }
        };

        const updated = users[userIndex];
        res.json({ id: updated.id, email: updated.email, favoriteTeam: updated.favoriteTeam, favoriteDriver: updated.favoriteDriver, preferences: updated.preferences });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
