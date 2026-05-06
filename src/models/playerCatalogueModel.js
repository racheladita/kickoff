// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT ALL CATALOGUE ITEMS (SHOP)
// ##############################################################
module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM PlayerCatalogue 
        ORDER BY unlock_cost ASC
    `;
    pool.query(SQLSTATEMENT, callback);
};

// ##############################################################
// SELECT CATALOGUE ITEM BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT * 
        FROM PlayerCatalogue 
        WHERE catalogue_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT CATALOGUE ITEM BY NAME
// ##############################################################
module.exports.selectByName = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT catalogue_id 
        FROM PlayerCatalogue 
        WHERE name = ?
    `;
    const VALUES = [data.name];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// INSERT NEW CATALOGUE ITEM
// ##############################################################
module.exports.insert = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO PlayerCatalogue (name, description, position, rating, unlock_cost) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const VALUES = [data.name, data.description, data.position, data.rating, data.unlock_cost];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// UPDATE CATALOGUE ITEM
// ##############################################################
module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE PlayerCatalogue 
        SET name = ?, description = ?, position = ?, rating = ?, unlock_cost = ? 
        WHERE catalogue_id = ?
    `;
    const VALUES = [data.name, data.description, data.position, data.rating, data.unlock_cost, data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// DELETE CATALOGUE ITEM
// ##############################################################
module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM PlayerCatalogue 
        WHERE catalogue_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};