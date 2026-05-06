// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/matchModel');

// ##############################################################
// MIDDLEWARE: PREPARE HOME DATA (Owner + Strength)
// ##############################################################
module.exports.prepareHomeData = (req, res, next) => {
    const teamId = req.body.home_team_id || res.locals.team_id;

    if (!teamId) {
        return res.status(400).json({ message: "Error: home_team_id is required" });
    }

    const data = { team_id: teamId };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to prepare home data: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "Home team not found" });
        } else {
            // SECURITY: Ensure authenticated user owns the team starting the match
            if (Number(results[0].user_id) !== Number(res.locals.userId)) {
                return res.status(403).json({ message: "Error: You do not own this team" });
            }
            res.locals.homeOwnerId = results[0].user_id;
            res.locals.homeName = results[0].name;
            res.locals.homeStrength = results[0].total_strength || 0;
            res.locals.homeTeamId = teamId;
            next();
        }
    };

    model.getTeamDetailsForMatch(data, callback);
};

// ##############################################################
// MIDDLEWARE: PREPARE AWAY DATA (Opponent ID + Owner + Strength)
// ##############################################################
module.exports.prepareAwayData = (req, res, next) => {
    const data = { 
        user_id: res.locals.homeOwnerId 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to prepare away data: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "No opponents available." });
        } else {
            res.locals.awayTeamId = results[0].team_id;
            res.locals.awayName = results[0].name;
            res.locals.awayOwnerId = results[0].user_id;
            res.locals.awayStrength = results[0].total_strength || 0;
            next();
        }
    };

    model.findOpponentDetailsForMatch(data, callback);
};

// ##############################################################
// MIDDLEWARE: PERFORM MATCH CALCULATION
// ##############################################################
module.exports.match = (req, res, next) => {
    const homeStr = res.locals.homeStrength;
    const awayStr = res.locals.awayStrength;

    // Probability Formula: 50 + (Diff / 10)
    const diff = homeStr - awayStr;
    const homeWinProb = Math.min(Math.max(50 + (diff / 10), 5), 95);

    const roll = Math.random() * 100;
    let winner = null;
    let homeScore = 0;
    let awayScore = 0;

    // 45/10/45 for equal strength (homeWinProb = 50)
    if (roll < (homeWinProb - 5)) {
        winner = res.locals.homeTeamId;
        homeScore = Math.floor(Math.random() * 4) + 1;
        awayScore = Math.floor(Math.random() * homeScore);
    } else if (roll > (homeWinProb + 5)) {
        winner = res.locals.awayTeamId;
        awayScore = Math.floor(Math.random() * 4) + 1;
        homeScore = Math.floor(Math.random() * awayScore);
    } else {
        homeScore = Math.floor(Math.random() * 3);
        awayScore = homeScore;
    }

    res.locals.matchResult = {
        home_team_id: res.locals.homeTeamId,
        away_team_id: res.locals.awayTeamId,
        home_score: homeScore,
        away_score: awayScore,
        winner_team_id: winner,
        home_win_probability: homeWinProb.toFixed(2) + "%"
    };

    next();
};

// ##############################################################
// MIDDLEWARE: AWARD HOME REWARDS
// ##############################################################
module.exports.awardHomeRewards = (req, res, next) => {
    const result = res.locals.matchResult;
    if (!result) {
        return next();
    }

    // Loss
    let pts = 25; 
    let ratingPts = -1; // Deduct rating on loss

    if (result.winner_team_id === result.home_team_id) {
        // Win
        pts = 100; 
        ratingPts = 2;
    } else if (result.winner_team_id === null) {
        // Draw
        pts = 50; 
        ratingPts = 0; // Neutral for draw
    }

    const data = {
        user_id: res.locals.homeOwnerId,
        team_id: result.home_team_id,
        points: pts,
        rating: ratingPts
    };

    const callback = (error) => {
        if (error) {
            console.error("Error to award home rewards: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.locals.homeAwarded = pts;
            next();
        }
    };

    model.awardMatchRewards(data, callback);
};

// ##############################################################
// MIDDLEWARE: AWARD AWAY REWARDS
// ##############################################################
module.exports.awardAwayRewards = (req, res, next) => {
    const result = res.locals.matchResult;
    if (!result) {
        return next();
    }

    // Loss
    let pts = 25; 
    let ratingPts = -1; // Deduct rating on loss

    if (result.winner_team_id === result.away_team_id) {
        // Win
        pts = 100; 
        ratingPts = 2;
    } else if (result.winner_team_id === null) {
        // Draw
        pts = 50; 
        ratingPts = 0; // Neutral for draw
    }

    const data = {
        user_id: res.locals.awayOwnerId,
        team_id: result.away_team_id,
        points: pts,
        rating: ratingPts
    };

    const callback = (error) => {
        if (error) {
            console.error("Error to award away rewards: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.locals.awayAwarded = pts;
            next();
        }
    };

    model.awardMatchRewards(data, callback);
};

// ##############################################################
// MIDDLEWARE: RECORD MATCH RESULTS & SEND RESPONSE
// ##############################################################
module.exports.recordMatch = (req, res, next) => {
    const data = res.locals.matchResult;

    let badges = null;
    if (res.locals.badgesAwarded && res.locals.badgesAwarded.length > 0) {
        badges = res.locals.badgesAwarded;
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error record match: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json({
                message: "Match complete!",
                match_result: {
                    home_score: res.locals.matchResult.home_score,
                    away_score: res.locals.matchResult.away_score,
                    winner_team_id: res.locals.matchResult.winner_team_id,
                    home_team_name: res.locals.homeName,
                    away_team_name: res.locals.awayName
                },
                rewards: {
                    home_user_earned: res.locals.homeAwarded,
                    away_user_earned: res.locals.awayAwarded
                },
                badges: badges
            });
        }
    };

    model.insertRecord(data, callback);
};

// ##############################################################
// GET MATCH HISTORY BY TEAM
// ##############################################################
module.exports.getHistory = (req, res) => {
    const data = { team_id: req.params.team_id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to get match history: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByTeamId(data, callback);
};

// ##############################################################
// GET GLOBAL MATCH HISTORY
// ##############################################################
module.exports.readAllMatches = (req, res, next) => {
    const callback = (error, results) => {
        if (error) {
            console.error("Error to read all matches: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    };
    model.selectAll(callback);
}

// ##############################################################
// GET TEAM MATCH STATISTICS
// ##############################################################
module.exports.getTeamStats = (req, res, next) => {
    const data = { team_id: req.params.team_id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to get team stats: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length === 0 || results[0].matches_played === 0) {
                res.status(200).json({
                    matches_played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0
                });
            } else {
                res.status(200).json(results[0]);
            }
        }
    };
    model.selectStatsByTeamId(data, callback);
}

// ##############################################################
// GET WIN LEADERBOARD
// ##############################################################
module.exports.readLeaderboard = (req, res, next) => {
    const callback = (error, results) => {
        if (error) {
            console.error("Error to read leaderboard: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    };
    model.selectLeaderboard(callback);
}
