// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/badgeModel');
const userBadgeModel = require('../models/userBadgeModel');

// ##############################################################
// READ ALL BADGES
// ##############################################################
module.exports.readAllBadges = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read all badges: ", error);
            res.status(500).json({ message: "Internal server error" });
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
            res.status(500).json({ message: "Internal server error" });
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

    let image = req.body.image;
    if (req.file) {
        image = '/uploads/' + req.file.filename;
    }

    const data = {
        name: req.body.name,
        description: req.body.description,
        image: image
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to create badge: ", error);
            res.status(500).json({ message: "Internal server error" });
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

    let image = req.body.image || res.locals.item.image;
    if (req.file) {
        image = '/uploads/' + req.file.filename;
    }

    const data = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        image: image
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to update badge: ", error);
            res.status(500).json({ message: "Internal server error" });
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
// MIDDLEWARE: CHECK BADGE AWARDS BEFORE DELETE
// ##############################################################
module.exports.checkBadgeAwards = (req, res, next) => {
    const data = {
        badge_id: req.params.id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking badge dependencies: ", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results[0].count > 0) {
            return res.status(409).json({ 
                message: `Cannot delete badge. It has been awarded to ${results[0].count} users.` 
            });
        }
        
        next();
    };

    userBadgeModel.countAwardsByBadgeId(data, callback);
};

// ##############################################################
// DELETE BADGE
// ##############################################################
module.exports.deleteBadge = (req, res, next) => {
    const data = { 
        id: req.params.id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to delete badge: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Badge not found" });
            } else {
                res.status(204).send();
            }
        }
    };

    model.deleteById(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK BADGE EXISTENCE
// ##############################################################
module.exports.checkBadge = (req, res, next) => {
    const data = {
        id: req.params.id || req.body.badge_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to check badge:", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "Badge not found" });
        } else {
            res.locals.item = results[0];
            next();
        }
    };

    model.selectById(data, callback);
};

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
            res.status(500).json({ message: "Internal server error" });
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
            res.status(500).json({ message: "Internal server error" });
        } else {
            // Initialize the array for newly awarded badges
            res.locals.badgesAwarded = [];

            const badgeMap = {};
            const badgeObjects = {};
            results.forEach(badge => {
                badgeMap[badge.name] = badge.badge_id;
                badgeObjects[badge.name] = badge;
            });
            res.locals.badgeMap = badgeMap;
            res.locals.badgeObjects = badgeObjects;
            next();
        }
    };

    model.selectAll(callback);
};
