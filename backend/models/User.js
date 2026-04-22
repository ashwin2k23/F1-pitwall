const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    favoriteTeam: {
        type: String,
        default: 'McLaren',
    },
    favoriteDriver: {
        type: String,
        default: 'Lando Norris',
    },
    preferences: {
        darkMode: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
        dashboardLayout: { type: Array, default: [] }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
