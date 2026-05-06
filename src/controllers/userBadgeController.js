// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/userBadgeModel');

// ##############################################################
// AWARD BADGE TO USER
// ##############################################################
module.exports.awardBadge = (req, res, next) => {
    if (req.body.user_id == undefined || req.body.badge_id == undefined) {
        res.status(400).json({
            message: "Error: user_id or badge_id is undefined"
        });
        return;
    }

    const data = {
        user_id: req.body.user_id,
        badge_id: req.body.badge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to award badge: ", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                message: "Badge awarded successfully",
                user_badge_id: results.insertId,
                ...data
            });
        }
    }

    model.insert(data, callback);
}

// ##############################################################
// GET USER BADGES
// ##############################################################
module.exports.getUserBadges = (req, res, next) => {
    const data = {
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to get user badges: ", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }

    model.selectByUserId(data, callback);
}

// ##############################################################
// ACHIEVEMENT LOGIC (Middlewares)
// ##############################################################

// 1. FIRST GOAL
module.exports.checkFirstGoal = (req, res, next) => {
    const user = res.locals.user;
    const badgeName = "First Goal";

    let badgeId = null;
    if (res.locals.badgeMap) {
        badgeId = res.locals.badgeMap[badgeName];
    }

    // Skip if user doesn't exist, already completed a challenge, or badge mapping is missing
    if (!user || user.last_completed_at !== null || !badgeId) {
        return next();
    }

    const data = { 
        user_id: user.user_id, 
        badge_id: badgeId 
    };

    const callback = (error, results) => {
        if (!error && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(badgeName);
        }
        next();
    };

    model.insertIgnore(data, callback);
};

// 2. HAT TRICK
module.exports.checkHatTrick = (req, res, next) => {
    const user = res.locals.user;
    const badgeName = "Hat Trick";

    let badgeId = null;
    if (res.locals.badgeMap) {
        badgeId = res.locals.badgeMap[badgeName];
    }

    // Skip if user doesn't exist, today's count < 3, or badge mapping is missing
    if (!user || res.locals.todayCount < 3 || !badgeId) {
        return next();
    }

    const data = { 
        user_id: user.user_id, 
        badge_id: badgeId 
    };

    const callback = (err, results) => {
        if (!err && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(badgeName);
        }
        next();
    };

    model.insertIgnore(data, callback);
};

// 3. CONSISTENCY KING (7 Days)
module.exports.checkConsistencyKing = (req, res, next) => {
    const user = res.locals.user;
    const badgeName = "Consistency King";

    let badgeId = null;
    if (res.locals.badgeMap) {
        badgeId = res.locals.badgeMap[badgeName];
    }

    // Skip if user doesn't exist, streak < 7, or badge mapping is missing
    if (!user || user.streak_days < 7 || !badgeId) {
        return next();
    }

    const data = { 
        user_id: user.user_id, 
        badge_id: badgeId 
    };
    
    const callback = (err, results) => {
        if (!err && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(badgeName);
        }
        next();
    };

    model.insertIgnore(data, callback);
};

// 4. ELITE STRIKER (Awarded to User if any player reaches 75)
module.exports.checkEliteStriker = (req, res, next) => {
    const badgeName = "Elite Striker";

    let badgeId = null;
    if (res.locals.badgeMap) {
        badgeId = res.locals.badgeMap[badgeName];
    }
    
    if (!badgeId) {
        return next();
    }

    const checks = [];

    // Context 1: Player Unlock
    if (res.locals.unlockContext) {
        checks.push({
            user_id: res.locals.user.user_id,
            team_id: res.locals.unlockContext.team_id
        });
    }

    // Context 2: Match (Home Team Only)
    if (res.locals.homeOwnerId && res.locals.homeTeamId) {
        checks.push({
            user_id: res.locals.homeOwnerId,
            team_id: res.locals.homeTeamId
        });
    }

    if (checks.length === 0) {
        return next();
    }
    
    const context = checks[0]; 
    
    const data = { 
        user_id: context.user_id,
        badge_id: badgeId,
        team_id: context.team_id
    };
    
    const callback = (err, results) => {
        if (!err && results.affectedRows > 0) {
            if (!res.locals.badgesAwarded) {
                res.locals.badgesAwarded = []; 
            }
            res.locals.badgesAwarded.push(badgeName);
        }
        next();
    };

    model.insertIfElite(data, callback);
};

// 5. FULL SQUAD (Awarded to User if team size >= 5)
module.exports.checkFullSquad = (req, res, next) => {
    const user = res.locals.user;
    const badgeName = "Full Squad";

    let badgeId = null;
    if (res.locals.badgeMap) {
        badgeId = res.locals.badgeMap[badgeName];
    }

    // Skip if user doesn't exist, team size < 5, or badge mapping is missing
    if (!user || res.locals.teamSize < 5 || !badgeId) {
        return next();
    }

    const data = { 
        user_id: user.user_id, 
        badge_id: badgeId 
    };

    const callback = (err, results) => {
        if (!err && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(badgeName);
        }
        next();
    };

    model.insertIgnore(data, callback);
};