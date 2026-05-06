// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');
const playerController = require('../controllers/playerController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Team CRUD
router.get("/user/:user_id", controller.getTeamByUser);
router.get("/", controller.readAllTeams);
router.get("/:id", controller.readTeamById);
router.post("/", controller.checkTeamOwnership, controller.createTeam);
router.put("/:id", controller.checkTeamOwner, controller.updateTeam);
router.delete("/:id", controller.checkTeamOwner, controller.deleteTeam);

// Team Roster
router.get("/:team_id/players", playerController.getTeamRoster);

module.exports = router;
