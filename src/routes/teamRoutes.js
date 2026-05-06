// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');
const playerController = require('../controllers/playerController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Team CRUD
router.get("/user/:user_id", controller.getTeamByUser);
router.get("/", controller.readAllTeams);
router.get("/:id", controller.readTeamById);
router.post("/", jwtMiddleware.verifyToken, controller.checkTeamOwnership, controller.checkDuplicateTeamName, controller.createTeam);
router.put("/:id", jwtMiddleware.verifyToken, controller.checkTeamOwner, controller.checkDuplicateTeamName, controller.updateTeam);
router.delete("/:id", jwtMiddleware.verifyToken, controller.checkTeamOwner, controller.checkMatchHistory, controller.deleteTeam);

// Team Roster
router.get("/:team_id/players", playerController.getTeamRoster);

module.exports = router;
