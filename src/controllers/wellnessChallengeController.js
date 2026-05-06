// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/wellnessChallengeModel');

// ##############################################################
// GET ALL CHALLENGES (Section D Req 6)
// ##############################################################
module.exports.readAllChallenges = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read all challenges: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }
    model.selectAll(callback);
}

// ##############################################################
// GET CHALLENGE BY ID
// ##############################################################
module.exports.readChallengeById = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read challenge by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Challenge not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// GET CHALLENGES BY CREATOR
// ##############################################################
module.exports.readChallengesByCreator = (req, res, next) => {
    const data = { 
        user_id: req.params.user_id 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read challenges by creator: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }
    model.selectByCreatorId(data, callback);
}

// ##############################################################
// CREATE NEW CHALLENGE (Section D Req 5)
// ##############################################################
module.exports.createChallenge = (req, res, next) => {
    if (req.body.description == undefined || req.body.points == undefined || req.body.user_id == undefined) {
        res.status(400).json({
            message: "Error: description, points, or user_id is undefined"
        });
        return;
    }

    const data = {
        creator_id: req.body.user_id,
        description: req.body.description,
        points: req.body.points
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to create challenge: ", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                challenge_id: results.insertId,
                ...data
            });
        }
    }

    model.insert(data, callback);
}

// ##############################################################
// MIDDLEWARE: PREPARE COMPLETION DATA (User + Challenge Check)
// ##############################################################
module.exports.prepareCompletion = (req, res, next) => {
    const data = {
        challenge_id: req.params.id,
        user_id: req.body.user_id
    };

    if (!data.challenge_id || !data.user_id) {
        return res.status(400).json({ message: "Error: challenge_id and user_id are required" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error to prepare completion:", error);
            res.status(500).json(error);
        } else if (results.length === 0) {
            res.status(404).json({ message: "User or Challenge not found" });
        } else {
            res.locals.completionContext = results[0];
            next();
        }
    };

    model.getCompletionContext(data, callback);
};

// ##############################################################
// FINAL RESPONSE (Section D Req 9)
// ##############################################################
module.exports.sendCompletionResponse = (req, res, next) => {
    const player = res.locals.player;
    
    let playerUpdate = null;
    if (player) {
        playerUpdate = {
            rating: player.rating,
            streak: player.streak_days
        };
    }

    let badges = null;
    if (res.locals.badgesAwarded.length > 0) {
        badges = res.locals.badgesAwarded;
    }

    res.status(201).json({
        complete_id: res.locals.completion_id,
        challenge_id: req.params.id,
        user_id: req.body.user_id,
        details: req.body.details,
        message: "Challenge completed successfully!",
        points_gained: res.locals.challenge.points,
        current_points: res.locals.newPoints,
        player_update: playerUpdate,
        badges: badges
    });
};

// ##############################################################
// MIDDLEWARE: CHECK CHALLENGE EXISTS
// ##############################################################
module.exports.checkChallenge = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to check challenge: ", error);
            res.status(500).json(error);
        } else if (results.length === 0) {
            res.status(404).json({ message: "Challenge not found" });
        } else {
            res.locals.challenge = results[0];
            next();
        }
    };

    model.selectById(data, callback);
};

// ##############################################################
// MIDDLEWARE: CHECK CHALLENGE OWNERSHIP (Section D Req 8)
// ##############################################################
module.exports.checkChallengeOwnership = (req, res, next) => {
    if (req.body.user_id == undefined) {
        res.status(400).json({ message: "Error: user_id is required" });
        return;
    }

    const data = { 
        id: req.params.id 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking ownership:", error);
            res.status(500).json(error);
            return;
        }
        if (results.length == 0) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        const challenge = results[0];
        if (challenge.creator_id != req.body.user_id) {
            res.status(403).json({ message: "Forbidden: Not the challenge creator" });
            return;
        }

        res.locals.challengeOwnerId = challenge.creator_id;
        next();
    };

    model.selectById(data, callback);
};

// ##############################################################
// UPDATE CHALLENGE BY ID (Section D Req 8)
// ##############################################################
module.exports.updateChallengeById = (req, res, next) => {
    if (req.body.description == undefined || req.body.points == undefined) {
        res.status(400).json({ message: "Error: description or points is undefined" });
        return;
    }

    const data = {
        id: req.params.id,
        description: req.body.description,
        points: req.body.points
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error updateChallengeById: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json({
                challenge_id: data.id,
                description: data.description,
                points: data.points,
                creator_id: res.locals.challengeOwnerId
            });
        }
    };

    model.updateById(data, callback);
};

// ##############################################################
// DELETE CHALLENGE BY ID (Section D Req 7)
// ##############################################################
module.exports.deleteChallengeById = (req, res, next) => {
    const data = {
        id: req.params.id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteChallengeById: ", error);
            res.status(500).json(error);
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({
                    message: "Challenge not found"
                });
            } else {
                res.status(204).send();
            }
        }
    }

    model.deleteById(data, callback);
}
