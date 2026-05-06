// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/playerCatalogueController');
const userController = require('../controllers/userController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const upload = require('../middlewares/upload');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

router.get("/", controller.getCatalogue);
router.get("/:id", controller.getCatalogueById);

// Admin Routes
router.post("/", jwtMiddleware.verifyToken, userController.checkSuperAdmin, upload.single('image'), controller.checkDuplicateName, controller.createCatalogueItem);
router.put("/:id", jwtMiddleware.verifyToken, userController.checkSuperAdmin, upload.single('image'), controller.checkCatalogue, controller.checkDuplicateName, controller.updateCatalogueItem);
router.delete("/:id", jwtMiddleware.verifyToken, userController.checkSuperAdmin, controller.checkCatalogue, controller.checkPlayerUsage, controller.deleteCatalogueItem);

module.exports = router;
