// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require('../services/db');

// ##############################################################
// SELECT PLAYERS BY TEAM ID (ROSTER)
// ##############################################################
module.exports.selectByTeamId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT p.player_id, p.team_id, p.rating, p.unlocked_at, p.catalogue_id,
               pc.name, pc.position, pc.unlock_cost, pc.image
        FROM Player p
        JOIN PlayerCatalogue pc ON p.catalogue_id = pc.catalogue_id
        WHERE p.team_id = ?
        ORDER BY p.rating DESC
    `;
    const VALUES = [data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// SELECT PLAYER BY ID
// ##############################################################
module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT p.*, pc.name, pc.position, pc.unlock_cost, pc.image, t.user_id, pc.description 
        FROM Player p
        JOIN PlayerCatalogue pc ON p.catalogue_id = pc.catalogue_id
        JOIN Team t ON p.team_id = t.team_id
        WHERE p.player_id = ?
    `;
    const VALUES = [data.id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// GET UNLOCK CONTEXT (User Points + Team + Catalogue Check)
// ##############################################################
module.exports.getUnlockContext = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            u.points, 
            t.team_id, 
            pc.unlock_cost, 
            pc.rating,
            (
                SELECT COUNT(*) 
                FROM Player 
                WHERE team_id = t.team_id 
                AND catalogue_id = pc.catalogue_id
            ) as already_unlocked
        FROM User u
        JOIN Team t ON u.user_id = t.user_id
        JOIN PlayerCatalogue pc ON pc.catalogue_id = ?
        WHERE u.user_id = ?;
    `;
    const VALUES = [data.catalogue_id, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// PERFORM UNLOCK TRANSACTION (Deduct Points + Insert + Get Size)
// ##############################################################
module.exports.performUnlock = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE User 
        SET points = points - ? 
        WHERE user_id = ?;
        
        INSERT INTO Player (team_id, catalogue_id, rating) 
        VALUES (?, ?, ?);
        
        SELECT COUNT(*) as team_size 
        FROM Player 
        WHERE team_id = ?;
    `;
    const VALUES = [
        data.cost, 
        data.user_id, 
        data.team_id, 
        data.catalogue_id, 
        data.rating,
        data.team_id
    ];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// CHECK MAX RATING FOR TEAM (World Class Player Badge)
// ##############################################################
module.exports.selectMaxRatingByTeamId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT MAX(rating) as max_rating 
        FROM Player 
        WHERE team_id = ?
    `;
    const VALUES = [data.team_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// PERFORM RELEASE TRANSACTION (Delete + Refund)
// ##############################################################
module.exports.performRelease = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM Player 
        WHERE player_id = ?;
        
        UPDATE User 
        SET points = points + ? 
        WHERE user_id = ?;
    `;
    const VALUES = [data.player_id, data.refund, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

// ##############################################################
// COUNT PLAYERS BY CATALOGUE ID (For Delete Safety)
// ##############################################################
module.exports.countPlayersByCatalogueId = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) as count 
        FROM Player 
        WHERE catalogue_id = ?
    `;
    const VALUES = [data.catalogue_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
