const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../db');

const safeUser = (user) => ({
    id: user.id,
    email: user.email,
    favoriteTeam: user.favoriteTeam,
    favoriteDriver: user.favoriteDriver,
    preferences: user.preferences
});

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required.' });
    try {
        if (findUserByEmail(email)) {
            return res.status(400).json({ msg: 'An account with this email already exists. Please log in.' });
        }
        const user = createUser({ email, password });
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: safeUser(user) });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required.' });
    try {
        const user = findUserByEmail(email);
        if (!user) return res.status(400).json({ msg: 'Account not found. Please sign up first!' });
        if (user.password !== password) return res.status(400).json({ msg: 'Incorrect password. Please try again.' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: safeUser(user) });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
