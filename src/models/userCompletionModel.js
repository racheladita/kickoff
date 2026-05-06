// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT COMPLETIONS BY USER ID
// ##############################################################
module.exports.selectByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT uc.*, wc.title, wc.description, wc.points 
        FROM UserCompletion uc
        JOIN WellnessChallenge wc ON uc.challenge_id = wc.challenge_id
        WHERE uc.user_id = ?
        ORDER BY uc.completed_at DESC
        LIMIT 100
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT COMPLETIONS BY CHALLENGE ID
// ##############################################################
module.exports.selectByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT uc.*, u.username 
        FROM UserCompletion uc
        JOIN User u ON uc.user_id = u.user_id
        WHERE uc.challenge_id = ?
        ORDER BY uc.completed_at DESC
    `;
    const VALUES = [data.challenge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT COMPLETION BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM UserCompletion 
        WHERE completion_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// PERFORM COMPLETION TRANSACTION (Insert + Award Points + Update Streak + Get Stats)
// ##############################################################
module.exports.performCompletion = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserCompletion (challenge_id, user_id, details) 
        VALUES (?, ?, ?);

        UPDATE User 
        SET points = points + ? 
        WHERE user_id = ?;

        UPDATE User 
        SET streak_days = ?, last_completed_at = NOW() 
        WHERE user_id = ?;

        SELECT points 
        FROM User 
        WHERE user_id = ?;

        SELECT COUNT(*) as today_count 
        FROM UserCompletion 
        WHERE user_id = ? AND DATE(completed_at) = CURDATE();
    `;
    const VALUES = [
        data.challenge_id, data.user_id, data.details,
        data.points, data.user_id,
        data.streak_days, data.user_id,
        data.user_id,
        data.user_id
    ];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// COUNT COMPLETIONS BY USER ID FOR TODAY
// ##############################################################
module.exports.countTodayByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) as count 
        FROM UserCompletion 
        WHERE user_id = ? AND DATE(completed_at) = CURDATE()
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};