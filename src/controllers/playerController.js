// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/playerModel');

// ##############################################################
// GET TEAM ROSTER
// ##############################################################
module.exports.getTeamRoster = (req, res, next) => {
    const teamId = req.params.team_id;

    if (!teamId) {
        res.status(400).json({ message: "Error: team_id is required" });
        return;
    }

    const data = { 
        team_id: teamId 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to get team roster: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }
    model.selectByTeamId(data, callback);
}

// ##############################################################
// GET PLAYER BY ID
// ##############################################################
module.exports.readPlayerById = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to get player by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Player not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// MIDDLEWARE: PREPARE UNLOCK DATA (Points + Cost + Team + Duplicate Check)
// ##############################################################
module.exports.prepareUnlock = (req, res, next) => {
    const data = {
        user_id: req.body.user_id || res.locals.user_id,
        catalogue_id: req.params.id || req.body.catalogue_id
    };

    if (!data.user_id || !data.catalogue_id) {
        return res.status(400).json({ message: "Error: user_id and catalogue_id are required" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error to prepare unlock: ", error);
            res.status(500).json(error);
        } else if (results.length === 0) {
            res.status(404).json({ message: "Player catalogue item or user team not found" });
        } else {
            res.locals.unlockContext = results[0];
            next();
        }
    };

    model.getUnlockContext(data, callback);
};

// ##############################################################
// MIDDLEWARE: EXECUTE UNLOCK (Transaction)
// ##############################################################
module.exports.executeUnlock = (req, res, next) => {
    const context = res.locals.unlockContext;
    if (!context) {
        return res.status(500).json({ message: "Internal error: Unlock context missing" });
    }

    // 1. Validation Logic
    if (context.already_unlocked > 0) {
        return res.status(409).json({ message: "Player already exists in your team" });
    }
    if (context.points < context.unlock_cost) {
        return res.status(403).json({ message: "Insufficient points to unlock player" });
    }

    // 2. Data for Transaction
    const data = {
        user_id: req.body.user_id || res.locals.user_id,
        team_id: context.team_id,
        catalogue_id: req.params.id || req.body.catalogue_id,
        cost: context.unlock_cost,
        rating: context.rating
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to execute unlock: ", error);
            res.status(500).json(error);
        } else {
            // results[1] = INSERT results
            res.locals.player = {
                player_id: results[1].insertId,
                rating: context.rating
            };
            
            res.locals.newPoints = context.points - context.unlock_cost;
            
            // results[2] = SELECT team_size results
            res.locals.teamSize = results[2][0].team_size;
            
            // Badge logic requirement
            res.locals.user = { 
                user_id: data.user_id 
            }; 
            
            next();
        }
    };

    model.performUnlock(data, callback);
};

// ##############################################################
// SEND UNLOCK RESPONSE
// ##############################################################
module.exports.sendUnlockResponse = (req, res, next) => {
    let badges = null;
    if (res.locals.badgesAwarded && res.locals.badgesAwarded.length > 0) {
        badges = res.locals.badgesAwarded;
    }

    res.status(201).json({
        message: "Player unlocked successfully!",
        player_id: res.locals.player.player_id,
        remaining_points: res.locals.newPoints,
        badges: badges
    });
};

// ##############################################################
// MIDDLEWARE: PREPARE RELEASE (Get Player + Calc Refund)
// ##############################################################
module.exports.prepareRelease = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to prepare release: ", error);
            res.status(500).json(error);
        } else if (results.length === 0) {
            res.status(404).json({ message: "Player not found" });
        } else {
            const player = results[0];
            const requestUserId = req.body.user_id || res.locals.user_id;

            // OWNERSHIP CHECK
            if (requestUserId && player.user_id != requestUserId) {
                return res.status(403).json({ message: "Error: You do not own this player" });
            }

            // REFUND LOGIC: 50% of cost
            const refundAmount = Math.floor(player.unlock_cost * 0.5);
            
            res.locals.releaseData = {
                player_id: player.player_id,
                user_id: requestUserId, 
                refund: refundAmount
            };
            
            next();
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// EXECUTE RELEASE (Delete + Refund Transaction)
// ##############################################################
module.exports.releasePlayer = (req, res, next) => {
    const releaseData = res.locals.releaseData;
    
    if (!releaseData || !releaseData.user_id) {
         return res.status(400).json({ message: "Error: user_id is required to process refund" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error to release player: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json({ 
                message: "Player released successfully", 
                refund_amount: releaseData.refund 
            });
        }
    }
    model.performRelease(releaseData, callback);
}