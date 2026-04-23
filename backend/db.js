const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'users.json');

// Ensure the data directory and file exist
function ensureDB() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

function readUsers() {
    ensureDB();
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch {
        return [];
    }
}

function writeUsers(users) {
    ensureDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function findUserByEmail(email) {
    return readUsers().find(u => u.email === email) || null;
}

function findUserById(id) {
    return readUsers().find(u => u.id === id) || null;
}

function createUser({ email, password }) {
    const users = readUsers();
    const user = {
        id: Date.now().toString(),
        email,
        password,
        favoriteTeam: 'McLaren',
        favoriteDriver: 'Lando Norris',
        preferences: { darkMode: true, notifications: true }
    };
    users.push(user);
    writeUsers(users);
    return user;
}

function updateUser(id, updates) {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, preferences: { ...users[idx].preferences, ...(updates.preferences || {}) } };
    writeUsers(users);
    return users[idx];
}

module.exports = { findUserByEmail, findUserById, createUser, updateUser };
