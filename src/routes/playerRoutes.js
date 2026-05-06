// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/playerController');
const userController = require('../controllers/userController');
const badgeController = require('../controllers/badgeController');
const achievementController = require('../controllers/userBadgeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

router.post("/:id/unlock", 
    jwtMiddleware.verifyToken,
    userController.checkUserExists,
    controller.prepareUnlock,
    controller.executeUnlock,
    badgeController.initBadgeMapping,    
    achievementController.checkFullSquad,
    achievementController.checkWorldClassPlayer,
    controller.sendUnlockResponse
);

router.delete("/:id", jwtMiddleware.verifyToken, controller.prepareRelease, controller.releasePlayer);
router.get("/:id", controller.readPlayerById);

module.exports = router;
