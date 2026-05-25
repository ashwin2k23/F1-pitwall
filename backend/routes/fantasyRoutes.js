const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    getPredictionForRound,
    submitPredictionForRound,
    getUserLeagues,
    createLeagueController,
    joinLeagueController,
    getLeagueDetailsController,
    inviteBotController,
    simulateRaceController
} = require('../controllers/fantasyController');

// All fantasy routes are authenticated
router.use(auth);

// Predictions
router.get('/predictions/:round', getPredictionForRound);
router.post('/predictions/:round', submitPredictionForRound);

// Leagues
router.get('/leagues', getUserLeagues);
router.post('/leagues/create', createLeagueController);
router.post('/leagues/join', joinLeagueController);
router.get('/leagues/:leagueId', getLeagueDetailsController);
router.post('/leagues/:leagueId/invite-bot', inviteBotController);
router.post('/leagues/:leagueId/simulate-race', simulateRaceController);

module.exports = router;
