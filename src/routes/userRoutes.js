// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// User CRUD
router.get("/", controller.readAllUser); // Section D Requirement No. 2
router.get("/:id", controller.readUserById); // Section D Requirement No. 3
router.post("/", controller.checkDuplicateUser, controller.createNewUser); // Section D Requirement No. 1
router.post("/login", controller.login);
router.put("/:id", controller.checkUserOwner, controller.checkDuplicateOnUpdate, controller.updateUserById); // Section D Requirement No. 4
router.delete("/:id", controller.checkSuperAdmin, controller.deleteUserById);

module.exports = router;