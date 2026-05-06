// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT ALL CHALLENGES
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT wc.*, u.username as creator_name 
        FROM WellnessChallenge wc
        LEFT JOIN User u ON wc.creator_id = u.user_id
        ORDER BY wc.created_at DESC
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT CHALLENGE BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT wc.*, u.username as creator_name 
        FROM WellnessChallenge wc
        LEFT JOIN User u ON wc.creator_id = u.user_id
        WHERE wc.challenge_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT NEW CHALLENGE
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO WellnessChallenge (creator_id, title, description, points) 
        VALUES (?, ?, ?, ?)
    `;
    const VALUES = [data.creator_id, data.title, data.description, data.points];
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
        SET title = ?, description = ?, points = ? 
        WHERE challenge_id = ?
    `;
    const VALUES = [data.title, data.description, data.points, data.id];
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
        SELECT wc.*, u.username as creator_name 
        FROM WellnessChallenge wc
        LEFT JOIN User u ON wc.creator_id = u.user_id
        WHERE wc.creator_id = ?
        ORDER BY wc.created_at DESC
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// COUNT COMPLETIONS BY CHALLENGE ID
// ##############################################################
module.exports.countCompletions = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) as count 
        FROM UserCompletion 
        WHERE challenge_id = ?
    `;
    const VALUES = [data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
