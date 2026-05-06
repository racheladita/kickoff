//////////////////////////////////////////////////////
// REQUIRE BCRYPT MODULE
//////////////////////////////////////////////////////
const bcrypt = require("bcrypt");

//////////////////////////////////////////////////////
// SET SALT ROUNDS
//////////////////////////////////////////////////////
const saltRounds = 10;

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR COMPARING PASSWORD
//////////////////////////////////////////////////////
module.exports.comparePassword = (req, res, next) => {
    // Check password
    const callback = (error, isMatch) => {
        if (error) {
            console.error("Error bcrypt:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (isMatch) {
                next();
            } else {
                res.status(401).json({
                    message: "Wrong password",
                });
            }
        }
    };
    bcrypt.compare(req.body.password, res.locals.hash, callback);
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR HASHING PASSWORD
//////////////////////////////////////////////////////
module.exports.hashPassword = (req, res, next) => {
    if (req.body.password === undefined || req.body.password === "") {
        return next();
    }

    const callback = (error, hash) => {
        if (error) {
            console.error("Error bcrypt:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.locals.hash = hash;
            next();
        }
    };

    bcrypt.hash(req.body.password, saltRounds, callback);
};