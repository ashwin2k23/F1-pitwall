const {
    getPrediction,
    savePrediction,
    createLeague,
    joinLeague,
    getLeaguesForUser,
    getLeagueDetails,
    updateLeague,
    findUserById
} = require('../db');

// List of drivers for validation & bot simulations
const DRIVERS = [
    { id: 'max_verstappen', name: 'Max Verstappen', team: 'Red Bull' },
    { id: 'norris', name: 'Lando Norris', team: 'McLaren' },
    { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari' },
    { id: 'piastri', name: 'Oscar Piastri', team: 'McLaren' },
    { id: 'sainz', name: 'Carlos Sainz', team: 'Ferrari' },
    { id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari' },
    { id: 'russell', name: 'George Russell', team: 'Mercedes' },
    { id: 'perez', name: 'Sergio Perez', team: 'Red Bull' },
    { id: 'alonso', name: 'Fernando Alonso', team: 'Aston Martin' },
    { id: 'tsunoda', name: 'Yuki Tsunoda', team: 'RB' },
    { id: 'albon', name: 'Alex Albon', team: 'Williams' },
    { id: 'gasly', name: 'Pierre Gasly', team: 'Alpine' },
    { id: 'ocon', name: 'Esteban Ocon', team: 'Haas' },
    { id: 'hulkenberg', name: 'Nico Hulkenberg', team: 'Sauber' },
    { id: 'stroll', name: 'Lance Stroll', team: 'Aston Martin' },
    { id: 'magnussen', name: 'Kevin Magnussen', team: 'Haas' },
    { id: 'bottas', name: 'Valtteri Bottas', team: 'Sauber' },
    { id: 'zhou', name: 'Guanyu Zhou', team: 'Sauber' },
    { id: 'sargeant', name: 'Logan Sargeant', team: 'Williams' }
];

// Helper to select driver with weighted probability
const selectWeightedDriver = (weights) => {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (const [driverId, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            return DRIVERS.find(d => d.id === driverId) || DRIVERS[0];
        }
    }
    return DRIVERS[0];
};

// Simulated results generation
const generateSimulatedResults = () => {
    // Probability weights for winner
    const winnerWeights = {
        max_verstappen: 35,
        norris: 25,
        leclerc: 18,
        piastri: 10,
        hamilton: 5,
        sainz: 4,
        russell: 2,
        perez: 1
    };

    // Probability weights for pole
    const poleWeights = {
        leclerc: 30,
        max_verstappen: 25,
        norris: 22,
        russell: 10,
        piastri: 8,
        hamilton: 3,
        sainz: 2
    };

    // Probability weights for fastest lap
    const flWeights = {
        max_verstappen: 25,
        norris: 20,
        hamilton: 15,
        perez: 15,
        piastri: 10,
        russell: 10,
        leclerc: 5
    };

    return {
        winner: selectWeightedDriver(winnerWeights).id,
        pole: selectWeightedDriver(poleWeights).id,
        fastestLap: selectWeightedDriver(flWeights).id
    };
};

// Generate prediction for bots
const generateBotPrediction = (botStrategy) => {
    if (botStrategy === 'toto') {
        // Toto Wolff strategy: calculated, favors Hamilton/Russell/Norris
        return {
            winner: Math.random() > 0.45 ? 'norris' : 'russell',
            pole: Math.random() > 0.5 ? 'russell' : 'hamilton',
            fastestLap: Math.random() > 0.5 ? 'hamilton' : 'russell'
        };
    } else if (botStrategy === 'christian') {
        // Christian Horner strategy: biased strongly to Max Verstappen
        return {
            winner: 'max_verstappen',
            pole: 'max_verstappen',
            fastestLap: Math.random() > 0.4 ? 'max_verstappen' : 'perez'
        };
    } else if (botStrategy === 'gunther') {
        // Günther Steiner strategy: chaotic picks favoring midfielders
        const midfielders = ['hulkenberg', 'magnussen', 'tsunoda', 'albon', 'alonso'];
        const randomMid = () => midfielders[Math.floor(Math.random() * midfielders.length)];
        return {
            winner: Math.random() > 0.7 ? 'norris' : randomMid(),
            pole: Math.random() > 0.6 ? 'leclerc' : randomMid(),
            fastestLap: randomMid()
        };
    } else {
        // Fallback strategy
        return {
            winner: Math.random() > 0.5 ? 'norris' : 'max_verstappen',
            pole: Math.random() > 0.5 ? 'norris' : 'leclerc',
            fastestLap: 'piastri'
        };
    }
};

// GET /api/fantasy/predictions/:round
exports.getPredictionForRound = async (req, res) => {
    try {
        const { round } = req.params;
        const pred = getPrediction(req.user.id, round);
        res.json(pred || { winner: '', pole: '', fastestLap: '' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /api/fantasy/predictions/:round
exports.submitPredictionForRound = async (req, res) => {
    try {
        const { round } = req.params;
        const { winner, pole, fastestLap } = req.body;
        
        if (!winner || !pole || !fastestLap) {
            return res.status(400).json({ msg: 'Please select values for winner, pole, and fastest lap.' });
        }

        const pred = savePrediction(req.user.id, round, { winner, pole, fastestLap });
        res.json({ msg: 'Predictions saved successfully!', prediction: pred });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET /api/fantasy/leagues
exports.getUserLeagues = async (req, res) => {
    try {
        const leagues = getLeaguesForUser(req.user.id);
        res.json(leagues);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /api/fantasy/leagues/create
exports.createLeagueController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ msg: 'League name is required.' });
        }

        const user = findUserById(req.user.id);
        const league = createLeague(req.user.id, name, user.email);
        res.status(201).json({ msg: 'League created successfully!', league });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /api/fantasy/leagues/join
exports.joinLeagueController = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) {
            return res.status(400).json({ msg: 'Invite code is required.' });
        }

        const result = joinLeague(req.user.id, inviteCode);
        if (result.error) {
            return res.status(400).json({ msg: result.error });
        }

        res.json({ msg: 'Joined league successfully!', league: result.league });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET /api/fantasy/leagues/:leagueId
exports.getLeagueDetailsController = async (req, res) => {
    try {
        const { leagueId } = req.params;
        const league = getLeagueDetails(leagueId);
        if (!league) {
            return res.status(404).json({ msg: 'League not found.' });
        }

        // Verify if user is member
        if (!league.members.some(m => m.userId === req.user.id)) {
            return res.status(403).json({ msg: 'Access denied. You are not a member of this league.' });
        }

        res.json(league);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /api/fantasy/leagues/:leagueId/invite-bot
exports.inviteBotController = async (req, res) => {
    try {
        const { leagueId } = req.params;
        const { botName, botStrategy } = req.body;

        const league = getLeagueDetails(leagueId);
        if (!league) {
            return res.status(404).json({ msg: 'League not found.' });
        }

        if (league.creatorId !== req.user.id) {
            return res.status(403).json({ msg: 'Only the host can add bot competitors.' });
        }

        const botId = `bot_${Date.now()}`;
        league.members.push({
            userId: botId,
            displayName: `${botName || 'AI Challenger'} (AI)`,
            email: `${botId}@f1pitwall.com`,
            points: 0,
            isHost: false,
            isBot: true,
            botStrategy: botStrategy || 'random'
        });

        const updated = updateLeague(leagueId, league);
        res.json({ msg: 'AI Challenger added!', league: updated });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /api/fantasy/leagues/:leagueId/simulate-race
exports.simulateRaceController = async (req, res) => {
    try {
        const { leagueId } = req.params;
        const { round, raceName } = req.body;

        const league = getLeagueDetails(leagueId);
        if (!league) {
            return res.status(404).json({ msg: 'League not found.' });
        }

        if (league.creatorId !== req.user.id) {
            return res.status(403).json({ msg: 'Only the host can trigger race simulations.' });
        }

        const roundStr = round ? round.toString() : '1';
        
        // Generate actual race outcome
        const actualOutcome = generateSimulatedResults();
        const winnerName = DRIVERS.find(d => d.id === actualOutcome.winner)?.name || actualOutcome.winner;
        const poleName = DRIVERS.find(d => d.id === actualOutcome.pole)?.name || actualOutcome.pole;
        const flName = DRIVERS.find(d => d.id === actualOutcome.fastestLap)?.name || actualOutcome.fastestLap;

        const memberPoints = [];

        // Score each member
        league.members = league.members.map(member => {
            let pred = null;
            if (member.isBot) {
                // Auto generate predictions for bots
                pred = generateBotPrediction(member.botStrategy);
            } else {
                // Get prediction for actual user
                pred = getPrediction(member.userId, roundStr);
            }

            let winnerPts = 0;
            let polePts = 0;
            let flPts = 0;

            if (pred) {
                if (pred.winner === actualOutcome.winner) winnerPts = 25;
                if (pred.pole === actualOutcome.pole) polePts = 15;
                if (pred.fastestLap === actualOutcome.fastestLap) flPts = 10;
            }

            const totalEarned = winnerPts + polePts + flPts;
            const updatedPoints = member.points + totalEarned;

            memberPoints.push({
                userId: member.userId,
                displayName: member.displayName,
                prediction: pred ? {
                    winner: DRIVERS.find(d => d.id === pred.winner)?.name || 'None',
                    pole: DRIVERS.find(d => d.id === pred.pole)?.name || 'None',
                    fastestLap: DRIVERS.find(d => d.id === pred.fastestLap)?.name || 'None',
                } : null,
                pointsEarned: totalEarned,
                breakdown: { winnerPts, polePts, flPts }
            });

            return {
                ...member,
                points: updatedPoints
            };
        });

        // Build race simulation text commentary
        const commentary = [];
        commentary.push(`[LAP 1] 🟢 LIGHTS OUT! And away we go at ${raceName || 'the Grand Prix'}! All cars clean through turn 1.`);
        commentary.push(`[LAP 18] ⏱️ Race leader ${winnerName} is running a strong pace. ${poleName} is chasing closely.`);
        commentary.push(`[LAP 32] 🛠️ Pitstop window is active. Teams are prepping compound strategies.`);
        commentary.push(`[LAP 48] ⚡ Purple Sector set! Fastest lap of the race logged by ${flName}.`);
        commentary.push(`[LAP 57] 🏁 CHEQUERED FLAG! ${winnerName} takes victory at ${raceName || 'the Grand Prix'}!`);

        // Post-race Team Principal quotes
        const hasToto = league.members.some(m => m.botStrategy === 'toto');
        const hasChristian = league.members.some(m => m.botStrategy === 'christian');
        const hasGunther = league.members.some(m => m.botStrategy === 'gunther');

        if (hasToto) {
            const isWinnerMerc = ['George Russell', 'Lewis Hamilton', 'Lando Norris'].includes(winnerName);
            const quote = isWinnerMerc 
                ? "Toto Wolff: 'We always had the pace, we just had to extract it. Simply brilliant.'"
                : "Toto Wolff: 'We did not have the speed today. The other teams were in a different league.'";
            commentary.push(`[POST-RACE] 🎙️ ${quote}`);
        }
        if (hasChristian) {
            const isWinnerRedBull = ['Max Verstappen', 'Sergio Perez'].includes(winnerName);
            const quote = isWinnerRedBull
                ? "Christian Horner: 'Max was absolutely dominant today. A clinical drive, simply lovely.'"
                : "Christian Horner: 'A disappointing result. We need to analyze where we lost the balance.'";
            commentary.push(`[POST-RACE] 🎙️ ${quote}`);
        }
        if (hasGunther) {
            const isWinnerMid = ['Nico Hulkenberg', 'Kevin Magnussen', 'Yuki Tsunoda', 'Alex Albon', 'Fernando Alonso'].includes(winnerName);
            const quote = isWinnerMid
                ? "Günther Steiner: 'We look like absolute f***ing rockstars today! Unbelievable!'"
                : "Günther Steiner: 'We need to stop making these f***ing mistakes. It is unacceptable.'";
            commentary.push(`[POST-RACE] 🎙️ ${quote}`);
        }

        // Add to history
        const historyEntry = {
            round: roundStr,
            raceName: raceName || `Round ${roundStr}`,
            simulatedAt: new Date().toISOString(),
            results: {
                winner: winnerName,
                pole: poleName,
                fastestLap: flName
            },
            standings: memberPoints.sort((a, b) => b.pointsEarned - a.pointsEarned),
            commentary
        };

        league.history.push(historyEntry);

        // Update database
        const updated = updateLeague(leagueId, league);

        res.json({
            msg: 'Simulation completed!',
            results: {
                winner: winnerName,
                pole: poleName,
                fastestLap: flName,
            },
            pointsAwarded: memberPoints,
            commentary,
            league: updated
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
