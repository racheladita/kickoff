// ##############################################################
// REQUIRE MODULES
// ##############################################################
const model = require('../models/userCompletionModel');

// ##############################################################
// GET ALL COMPLETIONS FOR A USER
// ##############################################################
module.exports.readCompletionsByUser = (req, res, next) => {
    const data = {
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read completions by user: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json(results);
        }
    }

    model.selectByUserId(data, callback);
}

// ##############################################################
// READ CHALLENGE COMPLETIONS
// ##############################################################
module.exports.readChallengeCompletions = (req, res, next) => {
    const data = {
        challenge_id: req.params.id
    }
    
    const challenge = res.locals.challenge;

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to read challenge completions: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            res.status(200).json({
                challenge: challenge,
                completions: results
            });
        }
    }

    model.selectByChallengeId(data, callback);
}

// ##############################################################
// MIDDLEWARE: EXECUTE COMPLETION (Streak Logic + Transaction)
// ##############################################################
module.exports.executeCompletion = (req, res, next) => {
    const context = res.locals.completionContext;
    if (!context) {
        return res.status(500).json({ message: "Internal error: Completion context missing" });
    }

    const user_id = res.locals.userId;
    const challenge_id = req.params.id;
    const details = req.body.details;

    // 1. Streak Logic
    let newStreak = context.streak_days;
    let lastDate = null;
    if (context.last_completed_at) {
        lastDate = new Date(context.last_completed_at);
    }
    const today = new Date();
    
    // Normalize dates to midnight for comparison
    let lastDateNorm = null;
    if (lastDate) {
        lastDateNorm = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    }
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (!lastDateNorm) {
        newStreak = 1; // First time
    } else {
        const diffDays = Math.floor((todayNorm - lastDateNorm) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            newStreak += 1; // Continue streak
        } else if (diffDays > 1) {
            newStreak = 1; // Reset streak
        }
    }

    // 2. Data for Transaction
    const data = {
        user_id: user_id,
        challenge_id: challenge_id,
        details: details,
        points: context.challenge_points,
        streak_days: newStreak
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error to execute completion:", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            // results[3] = SELECT points (User), results[4] = SELECT count (Today)
            res.locals.completion_id = results[0].insertId;
            res.locals.newPoints = results[3][0].points;
            res.locals.todayCount = results[4][0].today_count;
            res.locals.newStreak = newStreak;
            // For badge controllers
            res.locals.user = { 
                user_id: user_id 
            }; 
            
            next();
        }
    };

    model.performCompletion(data, callback);
};

// ##############################################################
// GET COMPLETION BY ID
// ##############################################################
module.exports.readCompletionById = (req, res, next) => {
    const data = { 
        id: req.params.id 
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error to get completion by id: ", error);
            res.status(500).json({ message: "Internal server error" });
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Completion not found" });
            } else {
                res.status(200).json(results[0]);
            }
        }
    }
    model.selectById(data, callback);
}