// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/playerCatalogueController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

router.get("/", controller.getCatalogue);
router.get("/:id", controller.getCatalogueById);

// Admin Routes
router.post("/", controller.checkDuplicateName, controller.createCatalogueItem);
router.put("/:id", controller.checkCatalogue, controller.checkDuplicateName, controller.updateCatalogueItem);
router.delete("/:id", controller.checkCatalogue, controller.deleteCatalogueItem);

module.exports = router;
