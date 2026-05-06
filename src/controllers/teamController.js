// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/teamModel');
const matchModel = require('../models/matchModel');

// ##############################################################
// GET ALL TEAMS
// ##############################################################
module.exports.readAllTeams = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read all teams: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    }
    model.selectAll(callback);
}

// ##############################################################
// GET TEAM BY ID
// ##############################################################
module.exports.readTeamById = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read team by id: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Team not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// GET TEAM BY USER
// ##############################################################
module.exports.getTeamByUser = (req, res, next) => {
    let userId = req.params.user_id;

    if (!userId) {
        res.status(400).json({ message: "Error: user_id is required" });
        return;
    }

    const data = {
        user_id: userId
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error fetching team by user: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length == 0) {
                res.status(200).json({ message: "User has no team", team: null }); // 200 OK but null to indicate valid state
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectByUserId(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK EXISTING TEAM OWNERSHIP
// ##############################################################
module.exports.checkTeamOwnership = (req, res, next) => {
    const name = req.body.name;
    if (name == undefined) {
        res.status(400).json({
            message: "Error: name is undefined"
        });
        return;
    }

    const data = {
        user_id: res.locals.userId
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking existing team:", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length > 0) {
            res.status(400).json({ message: "Error: User already has a team. Only 1 team allowed per user." });
        } else {
            next();
        }
    };

    model.selectByUserId(data, callback);
};

// ##############################################################
// MIDDLEWARE: CHECK DUPLICATE TEAM NAME
// ##############################################################
module.exports.checkDuplicateTeamName = (req, res, next) => {
    const name = req.body.name;
    const teamId = req.params.id; // Only for updates

    if (!name) {
        return res.status(400).json({ message: "Error: name is required" });
    }

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking duplicate team name:", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length > 0) {
            // For updates, ignore if the name belongs to the current team
            if (teamId && results[0].team_id == teamId) {
                return next();
            }
            res.status(409).json({ message: "Conflict: Team name already taken" });
        } else {
            next();
        }
    };

    model.selectByName({ name }, callback);
};

// ##############################################################
// MIDDLEWARE: CHECK SPECIFIC TEAM OWNERSHIP (FOR UPDATE/DELETE)
// ##############################################################
module.exports.checkTeamOwner = (req, res, next) => {
    // Allow superadmin (userId 1) to bypass ownership check
    if (res.locals.userId == 1) {
        return next();
    }
    
    const data = { id: req.params.id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking team owner:", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length == 0) {
            res.status(404).json({ message: "Team not found" });
        } else {
            // Check if User ID matches Team Owner User ID
            if (results[0].user_id != res.locals.userId) {
                res.status(403).json({ message: "Error: You do not own this team" });
            } else {
                next();
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// CREATE TEAM
// ##############################################################
module.exports.createTeam = (req, res, next) => {
    const data = {
        user_id: res.locals.userId,
        name: req.body.name
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to create team: ", error); 
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(201).json({
                team_id: results.insertId,
                ...data
            });
        }
    }
    model.insert(data, callback);
}

// ##############################################################
// UPDATE TEAM
// ##############################################################
module.exports.updateTeam = (req, res, next) => {
    if (req.body.name == undefined) {
        res.status(400).json({
            message: "Error: name is undefined"
        });
        return;
    }

    const data = {
        id: req.params.id,
        name: req.body.name
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateTeam: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Team not found" });
            } else {
                res.status(200).json(data);
            }
        }
    }
    model.updateById(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK MATCH HISTORY BEFORE DELETE
// ##############################################################
module.exports.checkMatchHistory = (req, res, next) => {
    const data = {
        team_id: req.params.id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking team dependencies: ", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results[0].count > 0) {
            return res.status(409).json({ 
                message: `Cannot delete team. It has played ${results[0].count} matches.` 
            });
        }
        
        next();
    };

    matchModel.countMatchesByTeamId(data, callback);
};

// ##############################################################
// DELETE TEAM
// ##############################################################
module.exports.deleteTeam = (req, res, next) => {
    const data = {
        id: req.params.id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteTeam: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Team not found" });
            } else {
                res.status(204).send();
            }
        }
    };

    model.deleteById(data, callback);
}