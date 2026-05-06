// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT TEAM BY USER ID
// ##############################################################
module.exports.selectByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT t.team_id, t.name as team_name, t.user_id, t.created_at, u.username,
        (SELECT COUNT(*) FROM Player p WHERE p.team_id = t.team_id) as player_count
        FROM Team t
        LEFT JOIN User u ON t.user_id = u.user_id
        WHERE t.user_id = ?
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT ALL TEAMS
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT t.team_id, t.name as team_name, t.user_id, t.created_at, u.username,
        (SELECT COUNT(*) FROM Player p WHERE p.team_id = t.team_id) as player_count
        FROM Team t
        LEFT JOIN User u ON t.user_id = u.user_id
        ORDER BY t.created_at DESC
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT TEAM BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT t.team_id, t.name as team_name, t.user_id, t.created_at, u.username,
        (SELECT COUNT(*) FROM Player p WHERE p.team_id = t.team_id) as player_count
        FROM Team t
        LEFT JOIN User u ON t.user_id = u.user_id
        WHERE t.team_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CREATE NEW TEAM
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Team (user_id, name) 
        VALUES (?, ?)
    `;
    const VALUES = [data.user_id, data.name];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// UPDATE TEAM
// ##############################################################
module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Team 
        SET name = ? 
        WHERE team_id = ?
    `;
    const VALUES = [data.name, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// DELETE TEAM
// ##############################################################
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM Team 
        WHERE team_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// FIND RANDOM OPPONENT TEAM (FOR MATCHMAKING)
// ##############################################################
module.exports.findRandomOpponent = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT team_id, user_id 
        FROM Team 
        WHERE user_id != ? 
        ORDER BY RAND() 
        LIMIT 1;
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT TEAM BY NAME
// ##############################################################
module.exports.selectByName = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM Team 
        WHERE name = ?
    `;
    const VALUES = [data.name];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// COUNT PLAYERS BY TEAM ID
// ##############################################################
module.exports.countByTeamId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) as count 
        FROM Player 
        WHERE team_id = ?
    `;
    const VALUES = [data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
