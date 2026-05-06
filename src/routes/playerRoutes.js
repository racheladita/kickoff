// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/playerController');
const userController = require('../controllers/userController');
const badgeController = require('../controllers/badgeController');
const achievementController = require('../controllers/userBadgeController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

router.post("/:id/unlock", 
    userController.checkUserExists,
    controller.prepareUnlock,
    controller.executeUnlock,
    badgeController.initBadgeMapping,    
    achievementController.checkFullSquad,
    achievementController.checkEliteStriker,
    controller.sendUnlockResponse
);

router.delete("/:id", controller.prepareRelease, controller.releasePlayer);
router.get("/:id", controller.readPlayerById);

module.exports = router;
