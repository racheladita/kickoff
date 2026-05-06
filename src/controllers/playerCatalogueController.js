// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/playerCatalogueModel');

// ##############################################################
// GET CATALOGUE (SHOP)
// ##############################################################
module.exports.getCatalogue = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to get catalogue: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }
    model.selectAll(callback);
}

// ##############################################################
// GET CATALOGUE ITEM BY ID
// ##############################################################
module.exports.getCatalogueById = (req, res, next) => {
    const data = {
        id: req.params.id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to get catalogue by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Catalogue item not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK CATALOGUE EXISTENCE
// ##############################################################
module.exports.checkCatalogue = (req, res, next) => {
    const data = {
        id: req.params.id || req.body.catalogue_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to check catalogue:", error);
            res.status(500).json(error);
        } else if (results.length === 0) {
            res.status(404).json({ message: "Catalogue player not found" });
        } else {
            res.locals.item = results[0];
            next();
        }
    };

    model.selectById(data, callback);
};

// ##############################################################
// MIDDLEWARE: CHECK DUPLICATE PLAYER NAME
// ##############################################################
module.exports.checkDuplicateName = (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).json({ message: "Error: name is required" });
    }

    const data = { 
        name: req.body.name 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to check duplicate name:", error);
            res.status(500).json(error);
        } else if (results.length > 0 && results[0].catalogue_id != req.params.id) {
            res.status(409).json({ message: "Player name already exists in catalogue" });
        } else {
            next();
        }
    };

    model.selectByName(data, callback);
};

// ##############################################################
// CREATE CATALOGUE ITEM
// ##############################################################
module.exports.createCatalogueItem = (req, res, next) => {
    const data = {
        name: req.body.name,
        description: req.body.description,
        position: req.body.position,
        rating: req.body.rating,
        unlock_cost: req.body.unlock_cost
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to create catalogue item:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                catalogue_id: results.insertId,
                ...data
            });
        }
    };

    model.insert(data, callback);
};

// ##############################################################
// UPDATE CATALOGUE ITEM
// ##############################################################
module.exports.updateCatalogueItem = (req, res, next) => {
    const data = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        position: req.body.position,
        rating: req.body.rating,
        unlock_cost: req.body.unlock_cost
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to update catalogue item:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(data);
        }
    };

    model.updateById(data, callback);
};

// ##############################################################
// DELETE CATALOGUE ITEM
// ##############################################################
module.exports.deleteCatalogueItem = (req, res, next) => {
    const data = { id: req.params.id };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to delete catalogue item:", error);
            res.status(500).json(error);
        } else {
            res.status(204).send();
        }
    };

    model.deleteById(data, callback);
};