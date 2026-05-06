// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT ALL USERS
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email, points, streak_days, last_completed_at 
        FROM User
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT USER BY USERNAME (For Login)
// ##############################################################
module.exports.selectByUsername = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, password, email, points, streak_days, last_completed_at 
        FROM User 
        WHERE username = ?
    `;
    const VALUES = [data.username];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT USER BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email, points, streak_days, last_completed_at 
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
        SELECT user_id 
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
        SELECT user_id 
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
    // Note: Password update logic usually handled separately or conditionally
    const SQLSTATEMENT = `
        UPDATE User 
        SET username = ?, email = ?, points = ? 
        WHERE user_id = ?
    `;
    const VALUES = [data.username, data.email, data.points, data.id];
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
