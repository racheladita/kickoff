// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT ALL BADGES
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM Badge 
        ORDER BY name ASC
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT BADGE BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM Badge 
        WHERE badge_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT NEW BADGE
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO Badge (name, description, image) 
        VALUES (?, ?, ?)
    `;
    const VALUES = [data.name, data.description, data.image];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// UPDATE BADGE
// ##############################################################
module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE Badge 
        SET name = ?, description = ?, image = ? 
        WHERE badge_id = ?
    `;
    const VALUES = [data.name, data.description, data.image, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CHECK DUPLICATE NAME
// ##############################################################
module.exports.selectByName = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT badge_id 
        FROM Badge 
        WHERE name = ?
    `;
    const VALUES = [data.name];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CHECK DUPLICATE NAME (EXCLUDING CURRENT ID)
// ##############################################################
module.exports.selectByNameExcludingId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT badge_id 
        FROM Badge 
        WHERE name = ? AND badge_id != ?
    `;
    const VALUES = [data.name, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// DELETE BADGE
// ##############################################################
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM Badge 
        WHERE badge_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};