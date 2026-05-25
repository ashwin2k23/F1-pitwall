const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'users.json');
const PREDICTIONS_PATH = path.join(__dirname, 'data', 'predictions.json');
const LEAGUES_PATH = path.join(__dirname, 'data', 'leagues.json');

// Ensure the data directory and files exist
function ensureDB() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    if (!fs.existsSync(PREDICTIONS_PATH)) fs.writeFileSync(PREDICTIONS_PATH, JSON.stringify([], null, 2));
    if (!fs.existsSync(LEAGUES_PATH)) fs.writeFileSync(LEAGUES_PATH, JSON.stringify([], null, 2));
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

function getAllUsers() {
    return readUsers().map(u => ({
        id: u.id,
        email: u.email,
        favoriteTeam: u.favoriteTeam,
        favoriteDriver: u.favoriteDriver,
        displayName: u.preferences?.displayName || u.email.split('@')[0]
    }));
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

// Fantasy Predictions
function readPredictions() {
    ensureDB();
    try {
        return JSON.parse(fs.readFileSync(PREDICTIONS_PATH, 'utf-8'));
    } catch {
        return [];
    }
}

function writePredictions(predictions) {
    ensureDB();
    fs.writeFileSync(PREDICTIONS_PATH, JSON.stringify(predictions, null, 2));
}

function getPrediction(userId, round) {
    const preds = readPredictions();
    return preds.find(p => p.userId === userId && p.round === round.toString()) || null;
}

function savePrediction(userId, round, predictionData) {
    const preds = readPredictions();
    const idx = preds.findIndex(p => p.userId === userId && p.round === round.toString());
    
    const newPred = {
        userId,
        round: round.toString(),
        winner: predictionData.winner,
        pole: predictionData.pole,
        fastestLap: predictionData.fastestLap,
        submittedAt: new Date().toISOString()
    };

    if (idx !== -1) {
        preds[idx] = { ...preds[idx], ...newPred };
    } else {
        preds.push(newPred);
    }
    
    writePredictions(preds);
    return newPred;
}

// Fantasy Leagues
function readLeagues() {
    ensureDB();
    try {
        return JSON.parse(fs.readFileSync(LEAGUES_PATH, 'utf-8'));
    } catch {
        return [];
    }
}

function writeLeagues(leagues) {
    ensureDB();
    fs.writeFileSync(LEAGUES_PATH, JSON.stringify(leagues, null, 2));
}

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PIT-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function createLeague(userId, name, creatorEmail) {
    const leagues = readLeagues();
    const user = findUserById(userId);
    const displayName = user?.preferences?.displayName || creatorEmail.split('@')[0];
    
    const newLeague = {
        id: Date.now().toString(),
        name,
        creatorId: userId,
        inviteCode: generateInviteCode(),
        createdAt: new Date().toISOString(),
        members: [
            {
                userId,
                displayName,
                email: creatorEmail,
                points: 0,
                isHost: true,
                isBot: false
            },
            // Auto add F1 Team Principal bots to make it playable immediately
            {
                userId: 'bot_christian',
                displayName: 'Christian Horner (AI)',
                email: 'christian_bot@f1pitwall.com',
                points: 0,
                isHost: false,
                isBot: true,
                botStrategy: 'christian'
            },
            {
                userId: 'bot_toto',
                displayName: 'Toto Wolff (AI)',
                email: 'toto_bot@f1pitwall.com',
                points: 0,
                isHost: false,
                isBot: true,
                botStrategy: 'toto'
            },
            {
                userId: 'bot_gunther',
                displayName: 'Günther Steiner (AI)',
                email: 'gunther_bot@f1pitwall.com',
                points: 0,
                isHost: false,
                isBot: true,
                botStrategy: 'gunther'
            }
        ],
        history: [] // simulated races history
    };
    
    leagues.push(newLeague);
    writeLeagues(leagues);
    return newLeague;
}

function joinLeague(userId, inviteCode) {
    const leagues = readLeagues();
    const league = leagues.find(l => l.inviteCode.toUpperCase() === inviteCode.toUpperCase());
    if (!league) return { error: 'League not found' };
    
    if (league.members.some(m => m.userId === userId)) {
        return { error: 'You are already a member of this league' };
    }
    
    const user = findUserById(userId);
    const displayName = user?.preferences?.displayName || user.email.split('@')[0];
    
    league.members.push({
        userId,
        displayName,
        email: user.email,
        points: 0,
        isHost: false,
        isBot: false
    });
    
    writeLeagues(leagues);
    return { league };
}

function getLeaguesForUser(userId) {
    const leagues = readLeagues();
    return leagues.filter(l => l.members.some(m => m.userId === userId));
}

function getLeagueDetails(leagueId) {
    const leagues = readLeagues();
    return leagues.find(l => l.id === leagueId) || null;
}

function updateLeague(leagueId, updatedLeague) {
    const leagues = readLeagues();
    const idx = leagues.findIndex(l => l.id === leagueId);
    if (idx === -1) return null;
    leagues[idx] = updatedLeague;
    writeLeagues(leagues);
    return updatedLeague;
}

module.exports = { 
    findUserByEmail, 
    findUserById, 
    getAllUsers,
    createUser, 
    updateUser,
    getPrediction,
    savePrediction,
    createLeague,
    joinLeague,
    getLeaguesForUser,
    getLeagueDetails,
    updateLeague
};
