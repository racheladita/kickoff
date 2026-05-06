// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/userBadgeModel');

// ##############################################################
// AWARD BADGE TO USER
// ##############################################################
module.exports.awardBadge = (req, res, next) => {
    if (req.body.badge_id == undefined) {
        res.status(400).json({
            message: "Error: badge_id is undefined"
        });
        return;
    }

    const data = {
        user_id: res.locals.userId,
        badge_id: req.body.badge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to award badge: ", error);
            res.status(500).json({ message: "Internal server error" });
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
            res.status(500).json({ message: "Internal server error" });
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
    const badgeName = "First Goal";
    const context = res.locals.completionContext;
    const userId = res.locals.userId;
    const badgeMap = res.locals.badgeMap;
    
    if (!context || !userId || !badgeMap || !badgeMap[badgeName] || context.last_completed_at !== null) {
        return next();
    }

    const data = { 
        user_id: userId, 
        badge_id: badgeMap[badgeName] 
    };

    const callback = (error, results) => {
        if (!error && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(res.locals.badgeObjects[badgeName]);
        }
        next();
    };

    model.insertIgnore(data, callback);
};

// 2. HAT TRICK
module.exports.checkHatTrick = (req, res, next) => {
    const badgeName = "Hat Trick";
    const userId = res.locals.userId;
    const todayCount = res.locals.todayCount; 
    const badgeMap = res.locals.badgeMap;

    if (!userId || !todayCount || !badgeMap || !badgeMap[badgeName] || todayCount < 3) {
        return next();
    }

    const data = { 
        user_id: userId, 
        badge_id: badgeMap[badgeName] 
    };

    const callback = (error, results) => {
        if (!error && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(res.locals.badgeObjects[badgeName]);
        }
        next();
    };

    model.insertIgnore(data, callback);
};

// 3. CONSISTENCY KING (7 Days)
module.exports.checkConsistencyKing = (req, res, next) => {
    const badgeName = "Consistency King";
    const userId = res.locals.userId;
    const currentStreak = res.locals.newStreak;
    const badgeMap = res.locals.badgeMap;

    if (!userId || !currentStreak || !badgeMap || !badgeMap[badgeName] || currentStreak < 7) {
        return next();
    }

    const data = { 
        user_id: userId, 
        badge_id: badgeMap[badgeName] 
    };
    
    const callback = (error, results) => {
        if (!error && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(res.locals.badgeObjects[badgeName]);
        }
        next();
    };

    model.insertIgnore(data, callback);
};

// 4. WORLD CLASS PLAYER (Awarded to User if any player reaches 100)
module.exports.checkWorldClassPlayer = (req, res, next) => {
    const badgeName = "World Class Player";
    const badgeMap = res.locals.badgeMap;

    if (!badgeMap || !badgeMap[badgeName]) {
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
        badge_id: badgeMap[badgeName],
        team_id: context.team_id
    };
    
    const callback = (error, results) => {
        if (!error && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(res.locals.badgeObjects[badgeName]);
        }
        next();
    };

    model.insertIfWorldClassPlayer(data, callback);
};

// 5. FULL SQUAD (Awarded to User if team size >= 5)
module.exports.checkFullSquad = (req, res, next) => {
    const badgeName = "Full Squad";
    const userId = res.locals.userId;
    const teamSize = res.locals.teamSize;
    const badgeMap = res.locals.badgeMap;

    if (!badgeMap || !badgeMap[badgeName] || !userId || teamSize < 5) {
        return next();
    }

    const data = { 
        user_id: userId, 
        badge_id: badgeMap[badgeName] 
    };

    const callback = (error, results) => {
        if (!error && results.affectedRows > 0) {
            res.locals.badgesAwarded.push(res.locals.badgeObjects[badgeName]);
        }
        next();
    };

    model.insertIgnore(data, callback);
};