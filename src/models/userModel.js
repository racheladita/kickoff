// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT ALL USERS
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email, points, streak_days, last_completed_at, created_at, profile_pic 
        FROM User
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT USER BY USERNAME OR EMAIL (For Login)
// ##############################################################
module.exports.selectByUsernameOrEmail = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, password, email, points, streak_days, last_completed_at 
        FROM User 
        WHERE username = ? OR email = ?
    `;
    const VALUES = [data.identifier, data.identifier];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT USER BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email, points, streak_days, last_completed_at, profile_pic, created_at 
        FROM User 
        WHERE user_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CHECK USERNAME/EMAIL EXISTS (For Registration)
// ##############################################################
module.exports.checkDuplicate = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email 
        FROM User 
        WHERE username = ? OR email = ?
    `;
    const VALUES = [data.username, data.email];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CHECK USERNAME/EMAIL EXISTS (For Update - Excludes Self)
// ##############################################################
module.exports.checkDuplicateExcludingUser = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email 
        FROM User 
        WHERE (username = ? OR email = ?) AND user_id != ?
    `;
    const VALUES = [data.username, data.email, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT NEW USER (Register)
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO User (username, email, password, points) 
        VALUES (?, ?, ?, ?)
    `;
    const VALUES = [data.username, data.email, data.password, data.points || 0];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// UPDATE USER BY ID
// ##############################################################
module.exports.updateById = (data, callback) => {
    let SQLSTATEMENT = `UPDATE User SET username = ?, email = ?`;
    let VALUES = [data.username, data.email];

    if (data.password) {
        SQLSTATEMENT += `, password = ?`;
        VALUES.push(data.password);
    }

    if (data.profile_pic) {
        SQLSTATEMENT += `, profile_pic = ?`;
        VALUES.push(data.profile_pic);
    }
    
    // Points usually managed via specific actions, but kept for compatibility
    if (data.points !== undefined) {
        SQLSTATEMENT += `, points = ?`;
        VALUES.push(data.points);
    }

    SQLSTATEMENT += ` WHERE user_id = ?`;
    VALUES.push(data.id);

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CHECK USER DEPENDENCIES (Team Manager or Challenge Creator)
// ##############################################################
module.exports.checkDependencies = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            (SELECT COUNT(*) FROM Team WHERE user_id = ?) as team_count,
            (SELECT COUNT(*) FROM WellnessChallenge WHERE creator_id = ?) as challenge_count
    `;
    const VALUES = [data.id, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// DELETE USER BY ID
// ##############################################################
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM User 
        WHERE user_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
