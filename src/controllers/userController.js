// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/userModel');

// ##############################################################
// GET ALL USERS (Section D Req 2)
// ##############################################################
module.exports.readAllUser = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read all users: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }
    model.selectAll(callback);
}

// ##############################################################
// GET USER BY ID (Section D Req 3)
// ##############################################################
module.exports.readUserById = (req, res, next) => {
    const data = {
        id: req.params.id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read user by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK DUPLICATE USER (Username/Email)
// ##############################################################
module.exports.checkDuplicateUser = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to check duplicate user: ", error);
            res.status(500).json(error);
        } else if (results.length > 0) {
            res.status(409).json({ message: "Username or email already exists" });
        } else {
            next();
        }
    };

    model.checkDuplicate(data, callback);
};

// ##############################################################
// CREATE NEW USER (Register) (Section D Req 1)
// ##############################################################
module.exports.createNewUser = (req, res, next) => {
    if (req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) {
        res.status(400).json({
            message: "Error: username, email or password is undefined"
        });
        return;
    }

    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        points: 0
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to create new user: ", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                user_id: results.insertId,
                username: data.username,
                email: data.email,
                points: data.points
            });
        }
    }
    model.insert(data, callback);
}

// ##############################################################
// LOGIN USER
// ##############################################################
module.exports.login = (req, res, next) => {
    if (req.body.username == undefined || req.body.password == undefined) {
        res.status(400).json({
            message: "Error: username or password is undefined"
        });
        return;
    }

    const data = {
        username: req.body.username,
        password: req.body.password
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to login: ", error);
            res.status(500).json(error);
        } else {
            if (results.length == 0 || results[0].password !== data.password) {
                res.status(401).json({ message: "Invalid username or password" });
            } else {
                res.status(200).json({
                    user_id: results[0].user_id,
                    username: results[0].username,
                    points: results[0].points
                });
            }
        }
    }
    model.selectByUsername(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK USER UPDATE (Section D Req 4)
// ##############################################################
module.exports.checkDuplicateOnUpdate = (req, res, next) => {
    const data = {
        id: req.params.id,
        username: req.body.username,
        email: req.body.email
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to check duplicate on update: ", error);
            res.status(500).json(error);
        } else if (results.length > 0) {
            res.status(409).json({ message: "Username or email already exists" });
        } else {
            next();
        }
    };

    model.checkDuplicateExcludingUser(data, callback);
};

// ##############################################################
// UPDATE USER BY ID (Section D Req 4)
// ##############################################################
module.exports.updateUserById = (req, res, next) => {
    const data = {
        id: req.params.id,
        username: req.body.username,
        email: req.body.email,
        points: req.body.points
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to update user by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json({
                    user_id: parseInt(data.id),
                    username: data.username,
                    points: data.points
                });
            }
        }
    };

    model.updateById(data, callback);
};

// ##############################################################
// DELETE USER BY ID
// ##############################################################
module.exports.deleteUserById = (req, res, next) => {
    const data = {
        id: req.params.id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to delete user by id: ", error);
            res.status(500).json(error);
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(204).send();
            }
        }
    }
    model.deleteById(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK SUPER ADMIN (For Delete)
// ##############################################################
module.exports.checkSuperAdmin = (req, res, next) => {
    // If user_id is missing
    if (!req.body.user_id) {
        return res.status(400).json({ message: "Error: user_id is required" });
    }

    // Strict Check: Must be ID 1
    if (req.body.user_id != 1) {
        return res.status(403).json({ message: "Error: Only Superadmin can delete users" });
    }
    
    next();
};

// ##############################################################
// MIDDLEWARE: CHECK USER OWNER (For Update)
// ##############################################################
module.exports.checkUserOwner = (req, res, next) => {
    if (!req.body.user_id) {
        return res.status(400).json({ message: "Error: user_id is required" });
    }

    // Check if the body.user_id matches the target (params.id)
    if (req.body.user_id != req.params.id) {
        return res.status(403).json({ message: "Error: You are not authorized to modify this user" });
    }

    next();
};

// ##############################################################
// MIDDLEWARE: CHECK USER EXISTS (Section D Req 9)
// ##############################################################
module.exports.checkUserExists = (req, res, next) => {
    const userId = req.body.user_id;

    if (!userId) {
        res.status(400).json({ message: "Error: user_id is required" });
        return;
    }

    const data = { 
        id: userId 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to check user exists: ", error);
            res.status(500).json(error);
        } else if (results.length === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.locals.user = results[0];
            next();
        }
    };

    model.selectById(data, callback);
};