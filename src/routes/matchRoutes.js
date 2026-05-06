// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/matchController');
const badgeController = require('../controllers/badgeController');
const achievementController = require('../controllers/userBadgeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// A match between current team and a random opponent
router.post("/match", 
    jwtMiddleware.verifyToken,
    controller.prepareHomeData,         
    controller.prepareAwayData,         
    controller.match,                   
    controller.awardHomeRewards,
    controller.awardAwayRewards,
    badgeController.initBadgeMapping,    
    achievementController.checkWorldClassPlayer,
    controller.recordMatch        
);

// View Match History (Global)
router.get("/history", controller.readAllMatches);

// View Match History (By Team)
router.get("/history/:team_id", controller.getHistory);

// View Match Statistics (By Team)
router.get("/stats/:team_id", controller.getTeamStats);

// View Win Leaderboard
router.get("/leaderboard", controller.readLeaderboard);

module.exports = router;
