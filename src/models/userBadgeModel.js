// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT BADGES BY USER ID
// ##############################################################
module.exports.selectByUserId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT ub.user_badge_id, ub.awarded_at, b.name, b.description, b.image
        FROM UserBadge ub
        JOIN Badge b ON ub.badge_id = b.badge_id
        WHERE ub.user_id = ?
        ORDER BY ub.awarded_at DESC
    `;
    const VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// AWARD BADGE TO USER
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserBadge (user_id, badge_id) 
        VALUES (?, ?)
    `;
    const VALUES = [data.user_id, data.badge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT IGNORE (Prevents Duplicate Badges)
// ##############################################################
module.exports.insertIgnore = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT IGNORE INTO UserBadge (user_id, badge_id) 
        VALUES (?, ?)
    `;
    const VALUES = [data.user_id, data.badge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// AWARD WORLD CLASS PLAYER IF QUALIFIED
// ##############################################################
module.exports.insertIfWorldClassPlayer = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT IGNORE INTO UserBadge (user_id, badge_id)
        SELECT ?, ?
        FROM DUAL
        WHERE (
            SELECT MAX(rating) 
            FROM Player 
            WHERE team_id = ?
        ) >= 100;
    `;
    const VALUES = [data.user_id, data.badge_id, data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// COUNT AWARDS BY BADGE ID (For Delete Safety)
// ##############################################################
module.exports.countAwardsByBadgeId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) as count 
        FROM UserBadge 
        WHERE badge_id = ?
    `;
    const VALUES = [data.badge_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
