// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/badgeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Badge CRUD (Definitions)
router.get("/", controller.readAllBadges);
router.get("/:id", controller.readBadgeById);
router.post("/", jwtMiddleware.verifyToken, userController.checkSuperAdmin, upload.single('image'), controller.checkDuplicateName, controller.createBadge);
router.put("/:id", jwtMiddleware.verifyToken, userController.checkSuperAdmin, upload.single('image'), controller.checkBadge, controller.checkDuplicateName, controller.updateBadge);
router.delete("/:id", jwtMiddleware.verifyToken, userController.checkSuperAdmin, controller.checkBadgeAwards, controller.deleteBadge);

module.exports = router;