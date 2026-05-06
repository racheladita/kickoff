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

router.get("/", controller.readAllChallenges); // Section D Requirement No. 6
router.post("/", jwtMiddleware.verifyToken, controller.createChallenge); // Section D Requirement No. 5
router.get("/creator/:user_id", controller.readChallengesByCreator);
router.get("/:id/details", controller.readChallengeById);
router.get("/:id", controller.checkChallenge, completionController.readChallengeCompletions); // Section D Requirement No. 10

// Complete a wellness challenge
router.post("/:id", // Section D Requirement No. 9
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
router.put("/:id", jwtMiddleware.verifyToken, controller.checkChallengeOwnership, controller.updateChallengeById); // Section D Requirement No. 8
router.delete("/:id", jwtMiddleware.verifyToken, controller.checkChallengeOwnership, controller.deleteChallengeById); // Section D Requirement No. 7

module.exports = router;
