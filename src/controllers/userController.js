// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/userModel');

// ##############################################################
// GET ALL USERS
// ##############################################################
module.exports.readAllUser = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read all users: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    }
    model.selectAll(callback);
}

// ##############################################################
// GET USER BY ID
// ##############################################################
module.exports.readUserById = (req, res, next) => {
    const data = {
        id: req.params.id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read user by id: ", error);
            res.status(500).json({ message: "Internal server error" });
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
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length > 0) {
            res.status(409).json({ message: "Username or email already exists" });
        } else {
            next();
        }
    };

    model.checkDuplicate(data, callback);
};

// ##############################################################
// CREATE NEW USER (Registration)
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
        password: res.locals.hash, // Use hashed password from middleware
        points: 0
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to create new user: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(201).json({
                user_id: results.insertId,
                username: data.username,
                email: data.email,
                points: data.points,
                message: `User ${data.username} created successfully.`
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
        identifier: req.body.username
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to login: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length == 0) {
                res.status(401).json({ message: "Invalid username or password" });
            } else {
                res.locals.hash = results[0].password;
                res.locals.userId = results[0].user_id;
                res.locals.username = results[0].username;
                res.locals.message = "Login successful";
                next();
            }
        }
    }
    model.selectByUsernameOrEmail(data, callback);
}

// ##############################################################
// MIDDLEWARE: CHECK USER UPDATE
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
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length > 0) {
            let conflict = '';
            let usernameConflict = false;
            let emailConflict = false;

            for (const row of results) {
                if (row.username === data.username) {
                    usernameConflict = true;
                }
                if (row.email === data.email) {
                    emailConflict = true;
                }
            }

            if (usernameConflict && emailConflict) {
                conflict = 'both';
            } else if (usernameConflict) {
                conflict = 'username';
            } else if (emailConflict) {
                conflict = 'email';
            }
            res.status(409).json({ message: "Username or email already exists", conflict: conflict });
        } else {
            next();
        }
    };

    model.checkDuplicateExcludingUser(data, callback);
};

// ##############################################################
// UPDATE USER BY ID
// ##############################################################
module.exports.updateUserById = (req, res, next) => {
    // let profile_pic = req.body.profile_pic || res.locals.user.profile_pic;
    // if (req.file) {
    //     profile_pic = '/uploads/' + req.file.filename;
    // }

    const data = {
        id: req.params.id,
        username: req.body.username,
        email: req.body.email,
        password: res.locals.hash, // Use hash from bcryptMiddleware if present
        // profile_pic: profile_pic,
        points: req.body.points
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to update user by id: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json({
                    user_id: parseInt(data.id),
                    username: data.username,
                    email: data.email,
                    message: "User updated successfully"
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
            res.status(500).json({ message: "Internal server error" });
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
// MIDDLEWARE: VALIDATION (Superadmin Only)
// ##############################################################
module.exports.checkSuperAdmin = (req, res, next) => {
    // Strict Check: Must be ID 1
    if (res.locals.userId != 1) {
        return res.status(403).json({ message: "Error: Only Superadmin can delete users" });
    }
    
    next();
};

// ##############################################################
// MIDDLEWARE: OWNERSHIP VALIDATION
// ##############################################################
module.exports.checkUserOwner = (req, res, next) => {
    // Allow superadmin (userId 1) to update any user
    if (res.locals.userId == 1) {
        return next();
    }
    
    // Check if the authenticated userId matches the target (params.id)
    if (res.locals.userId != req.params.id) {
        return res.status(403).json({ message: "Error: You are not authorized to modify this user" });
    }

    next();
};

// ##############################################################
// MIDDLEWARE: DEPENDENCY INTEGRITY CHECK
// ##############################################################
module.exports.checkUserDependencies = (req, res, next) => {
    const data = {
        id: req.params.id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error checking user dependencies: ", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        const teamCount = results[0].team_count;
        const challengeCount = results[0].challenge_count;

        if (teamCount > 0 || challengeCount > 0) {
            let message = "Cannot delete user. Dependencies found: ";
            if (teamCount > 0) message += `User manages ${teamCount} team(s). `;
            if (challengeCount > 0) message += `User created ${challengeCount} challenge(s).`;
            
            return res.status(409).json({ message: message.trim() });
        }

        next();
    };

    model.checkDependencies(data, callback);
};

// ##############################################################
// MIDDLEWARE: EXISTENCE VALIDATION
// ##############################################################
module.exports.checkUserExists = (req, res, next) => {
    const userId = res.locals.userId;

    const data = { 
        id: userId 
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to check user exists: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else if (results.length === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.locals.user = results[0];
            next();
        }
    };

    model.selectById(data, callback);
};