// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const wellnessChallengeRoutes = require('./wellnessChallengeRoutes');
const teamRoutes = require('./teamRoutes');
const playerCatalogueRoutes = require('./playerCatalogueRoutes');
const playerRoutes = require('./playerRoutes');
const badgeRoutes = require('./badgeRoutes');
const userBadgeRoutes = require('./userBadgeRoutes');
const matchRoutes = require('./matchRoutes');
const completionRoutes = require('./userCompletionRoutes');

router.use("/users", userRoutes);
router.use("/challenges", wellnessChallengeRoutes);
router.use("/teams", teamRoutes);
router.use("/catalogue", playerCatalogueRoutes);
router.use("/players", playerRoutes);
router.use("/badges", badgeRoutes);
router.use("/user-badges", userBadgeRoutes);
router.use("/matches", matchRoutes);
router.use("/completions", completionRoutes);

module.exports = router;
