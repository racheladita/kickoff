// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const upload = require('../middlewares/upload');

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// User CRUD
router.get("/", controller.readAllUser);
router.get("/:id", controller.readUserById);
router.post("/", controller.checkDuplicateUser, bcryptMiddleware.hashPassword, controller.createNewUser);
router.post("/login", controller.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.put("/:id", jwtMiddleware.verifyToken, controller.checkUserOwner, upload.single('profile_pic'), controller.checkDuplicateOnUpdate, bcryptMiddleware.hashPassword, controller.updateUserById);
router.delete("/:id", jwtMiddleware.verifyToken, controller.checkSuperAdmin, controller.checkUserDependencies, controller.deleteUserById);

module.exports = router;