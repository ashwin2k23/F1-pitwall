const { findUserById, updateUser } = require('../db');

const safeUser = (user) => ({
    id: user.id,
    email: user.email,
    favoriteTeam: user.favoriteTeam,
    favoriteDriver: user.favoriteDriver,
    preferences: user.preferences
});

exports.getPreferences = async (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(safeUser(user));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updatePreferences = async (req, res) => {
    const { favoriteTeam, favoriteDriver, preferences } = req.body;
    try {
        const updates = {};
        if (favoriteTeam !== undefined) updates.favoriteTeam = favoriteTeam;
        if (favoriteDriver !== undefined) updates.favoriteDriver = favoriteDriver;
        if (preferences !== undefined) updates.preferences = preferences;

        const updated = updateUser(req.user.id, updates);
        if (!updated) return res.status(404).json({ msg: 'User not found' });
        res.json(safeUser(updated));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
