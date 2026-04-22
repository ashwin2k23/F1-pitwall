const jwt = require('jsonwebtoken');

// In-Memory Mock Database
const users = [];
exports.users = users;

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = { id: Date.now().toString(), email, password, favoriteTeam: 'McLaren', favoriteDriver: 'Lando Norris', preferences: { darkMode: true } };
        users.push(user);

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email, preferences: user.preferences, favoriteTeam: user.favoriteTeam, favoriteDriver: user.favoriteDriver } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = users.find(u => u.email === email);
        if (!user) {
             return res.status(400).json({ msg: 'Account not found. Please sign up first!' });
        }
        
        if (user.password !== password) {
             return res.status(400).json({ msg: 'Incorrect password. Please try again.' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email, preferences: user.preferences, favoriteTeam: user.favoriteTeam, favoriteDriver: user.favoriteDriver } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
