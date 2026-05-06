// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/badgeController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Badge CRUD (Definitions)
router.get("/", controller.readAllBadges);
router.get("/:id", controller.readBadgeById);
router.post("/", controller.checkDuplicateName, controller.createBadge);
router.put("/:id", controller.checkDuplicateName, controller.updateBadge);
router.delete("/:id", controller.deleteBadge);

module.exports = router;