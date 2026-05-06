// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userBadgeController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// User Achievement Routes
router.post("/award", controller.awardBadge);
router.get("/user/:user_id", controller.getUserBadges);

module.exports = router;
