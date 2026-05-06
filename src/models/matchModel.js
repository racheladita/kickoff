// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// GET TEAM DETAILS FOR MATCH
// ##############################################################
module.exports.getTeamDetailsForMatch = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            t.user_id, 
            t.name,
            (
                SELECT SUM(rating) 
                FROM (
                    SELECT rating FROM Player 
                    WHERE team_id = t.team_id 
                    ORDER BY rating DESC 
                    LIMIT 5
                ) as Top5
            ) as total_strength
        FROM Team t
        WHERE t.team_id = ?;
    `;
    const VALUES = [data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// FIND RANDOM OPPONENT WITH DETAILS (ID + Owner + Strength)
// ##############################################################
module.exports.findOpponentDetailsForMatch = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            t.team_id, 
            t.user_id, 
            t.name,
            (
                SELECT SUM(rating) 
                FROM (
                    SELECT rating FROM Player 
                    WHERE team_id = t.team_id 
                    ORDER BY rating DESC 
                    LIMIT 5
                ) as Top5
            ) as total_strength
        FROM Team t
        WHERE t.user_id != ? 
        ORDER BY RAND() 
        LIMIT 1;
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// AWARD MATCH REWARDS (User Points + Player Rating)
// ##############################################################
module.exports.awardMatchRewards = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE User SET points = points + ? WHERE user_id = ?;
        UPDATE Player SET rating = rating + ? WHERE team_id = ?;
    `;
    const VALUES = [data.points, data.user_id, data.rating, data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT MATCH RECORD
// ##############################################################
module.exports.insertRecord = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO MatchRecord (home_team_id, away_team_id, home_score, away_score, winner_team_id)
        VALUES (?, ?, ?, ?, ?);
    `;
    const VALUES = [
        data.home_team_id, 
        data.away_team_id, 
        data.home_score, 
        data.away_score, 
        data.winner_team_id
    ];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT MATCH HISTORY BY TEAM
// ##############################################################
module.exports.selectByTeamId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT mr.*, ht.name as home_name, at.name as away_name
        FROM MatchRecord mr
        JOIN Team ht ON mr.home_team_id = ht.team_id
        JOIN Team at ON mr.away_team_id = at.team_id
        WHERE mr.home_team_id = ? OR mr.away_team_id = ?
        ORDER BY mr.played_at DESC
        LIMIT 10;
    `;
    const VALUES = [data.team_id, data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT ALL MATCH HISTORY (Global)
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT mr.*, ht.name as home_name, at.name as away_name
        FROM MatchRecord mr
        JOIN Team ht ON mr.home_team_id = ht.team_id
        JOIN Team at ON mr.away_team_id = at.team_id
        ORDER BY mr.played_at DESC
        LIMIT 10;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT TEAM MATCH STATISTICS
// ##############################################################
module.exports.selectStatsByTeamId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            COUNT(*) as matches_played,
            SUM(CASE WHEN winner_team_id = ? THEN 1 ELSE 0 END) as wins,
            SUM(CASE WHEN winner_team_id IS NULL THEN 1 ELSE 0 END) as draws,
            SUM(CASE WHEN winner_team_id != ? AND winner_team_id IS NOT NULL THEN 1 ELSE 0 END) as losses
        FROM MatchRecord
        WHERE home_team_id = ? OR away_team_id = ?
        LIMIT 10;
    `;
    const VALUES = [data.team_id, data.team_id, data.team_id, data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT TEAM LEADERBOARD (By Wins)
// ##############################################################
module.exports.selectLeaderboard = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            t.team_id,
            t.name, 
            COUNT(mr.winner_team_id) as wins
        FROM Team t
        JOIN MatchRecord mr ON t.team_id = mr.winner_team_id
        GROUP BY t.team_id
        ORDER BY wins DESC
        LIMIT 10;
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// COUNT MATCHES BY TEAM ID (For Delete Safety)
// ##############################################################
module.exports.countMatchesByTeamId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) as count 
        FROM MatchRecord 
        WHERE home_team_id = ? OR away_team_id = ?
    `;
    const VALUES = [data.team_id, data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
