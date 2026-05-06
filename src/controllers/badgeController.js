// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/badgeModel');

// ##############################################################
// READ ALL BADGES
// ##############################################################
module.exports.readAllBadges = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read all badges: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }
    model.selectAll(callback);
}

// ##############################################################
// READ BADGE BY ID
// ##############################################################
module.exports.readBadgeById = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read badge by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Badge not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// CREATE NEW BADGE (Admin/System)
// ##############################################################
module.exports.createBadge = (req, res, next) => {
    if (req.body.name == undefined) {
        res.status(400).json({
            message: "Error: name is undefined"
        });
        return;
    }

    const data = {
        name: req.body.name,
        description: req.body.description
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to create badge: ", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                badge_id: results.insertId,
                ...data
            });
        }
    }
    model.insert(data, callback);
}

// ##############################################################
// UPDATE BADGE
// ##############################################################
module.exports.updateBadge = (req, res, next) => {
    if (req.body.name == undefined) {
        res.status(400).json({
            message: "Error: name is undefined"
        });
        return;
    }

    const data = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to update badge: ", error);
            res.status(500).json(error);
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Badge not found" });
            } else {
                res.status(200).json(data);
            }
        }
    }
    model.updateById(data, callback);
}

// ##############################################################
// DELETE BADGE
// ##############################################################
module.exports.deleteBadge = (req, res, next) => {
    const data = { id: req.params.id };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to delete badge: ", error);
            res.status(500).json(error);
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Badge not found" });
            } else {
                res.status(204).send();
            }
        }
    }
    model.deleteById(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK DUPLICATE BADGE NAME
// ##############################################################
module.exports.checkDuplicateName = (req, res, next) => {
    if (req.body.name == undefined) {
        return res.status(400).json({ message: "Error: name is required" });
    }

    const data = {
        name: req.body.name,
        id: req.params.id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking duplicate badge name:", error);
            res.status(500).json(error);
            return;
        }

        if (results.length > 0) {
            res.status(409).json({ message: "Badge name already exists" });
            return;
        }
        next();
    };

    if (data.id) {
        model.selectByNameExcludingId(data, callback);
    } else {
        model.selectByName(data, callback);
    }
};

// ##############################################################
// Badge Mapping Middleware
// This middleware is used to create a badge mapping object
// that can be used to map badge names to badge IDs.
// ##############################################################
module.exports.initBadgeMapping = (req, res, next) => {
    const callback = (error, results) => {
        if (error) {
            console.error("Error to initialise badge mapping: ", error);
            res.status(500).json(error);
        } else {
            // Initialize the array for newly awarded badges
            res.locals.badgesAwarded = [];

            const badgeMap = {};
            results.forEach(badge => {
                badgeMap[badge.name] = badge.badge_id;
            });
            res.locals.badgeMap = badgeMap;
            next();
        }
    };

    model.selectAll(callback);
};
