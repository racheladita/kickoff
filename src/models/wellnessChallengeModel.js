// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT ALL CHALLENGES
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM WellnessChallenge 
        ORDER BY created_at DESC
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT CHALLENGE BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM WellnessChallenge 
        WHERE challenge_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT NEW CHALLENGE
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO WellnessChallenge (creator_id, description, points) 
        VALUES (?, ?, ?)
    `;
    const VALUES = [data.creator_id, data.description, data.points];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// GET COMPLETION CONTEXT (User + Challenge Details)
// ##############################################################
module.exports.getCompletionContext = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            u.points as user_points, 
            u.streak_days, 
            u.last_completed_at,
            wc.points as challenge_points
        FROM User u
        CROSS JOIN WellnessChallenge wc
        WHERE u.user_id = ? AND wc.challenge_id = ?;
    `;
    const VALUES = [data.user_id, data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// UPDATE CHALLENGE BY ID
// ##############################################################
module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `  
        UPDATE WellnessChallenge 
        SET description = ?, points = ? 
        WHERE challenge_id = ?
    `;
    const VALUES = [data.description, data.points, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// DELETE CHALLENGE BY ID
// ##############################################################
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM WellnessChallenge 
        WHERE challenge_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT CHALLENGES BY CREATOR ID
// ##############################################################
module.exports.selectByCreatorId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM WellnessChallenge 
        WHERE creator_id = ?
        ORDER BY created_at DESC
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
