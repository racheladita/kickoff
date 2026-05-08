// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/wellnessChallengeController');
const badgeController = require('../controllers/badgeController');
const completionController = require('../controllers/userCompletionController');
const achievementController = require('../controllers/userBadgeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Challenge CRUD

router.get("/", controller.readAllChallenges);
router.post("/", jwtMiddleware.verifyToken, controller.createChallenge);
router.get("/creator/:user_id", controller.readChallengesByCreator);
router.get("/:id/details", controller.readChallengeById);
router.get("/:id", controller.checkChallenge, completionController.readChallengeCompletions);

// Complete a wellness challenge
router.post("/:id",
    jwtMiddleware.verifyToken,
    controller.checkChallenge,
    controller.prepareCompletion, 
    completionController.executeCompletion,
    badgeController.initBadgeMapping,    
    achievementController.checkFirstGoal,
    achievementController.checkHatTrick,
    achievementController.checkConsistencyKing,
    controller.sendCompletionResponse
);
router.put("/:id", jwtMiddleware.verifyToken, controller.checkChallengeOwnership, controller.updateChallengeById);
router.delete("/:id", jwtMiddleware.verifyToken, controller.checkChallengeOwnership, controller.deleteChallengeById);

module.exports = router;
