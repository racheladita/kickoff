// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userCompletionController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Completion CRUD
// No Delete Route as history is immutable
router.get("/user/:user_id", controller.readCompletionsByUser);
router.get("/:id", controller.readCompletionById);

module.exports = router;
