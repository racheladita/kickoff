// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require("../services/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const callback = (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
}

// ##############################################################
// DEFINE SQL STATEMENTS
// ##############################################################
bcrypt.hash('password', saltRounds, (error, hash) => {
  if (error) {
    console.error("Error hashing password:", error);
  } else {
    console.log("Hashed password:", hash);
    
    const SQLSTATEMENT = `
    DROP TABLE IF EXISTS UserBadge;
    DROP TABLE IF EXISTS MatchRecord;
    DROP TABLE IF EXISTS Player;
    DROP TABLE IF EXISTS PlayerCatalogue;
    DROP TABLE IF EXISTS Badge;
    DROP TABLE IF EXISTS Team;
    DROP TABLE IF EXISTS UserCompletion;
    DROP TABLE IF EXISTS WellnessChallenge;
    DROP TABLE IF EXISTS User;

    -- =====================
    -- CORE TABLES
    -- =====================
    CREATE TABLE User (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        points INT DEFAULT 0,
        streak_days INT DEFAULT 0,
        profile_pic VARCHAR(255),
        last_completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login_at DATETIME
    );

    CREATE TABLE WellnessChallenge (
        challenge_id INT PRIMARY KEY AUTO_INCREMENT,
        creator_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        points INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    CREATE TABLE UserCompletion (
        completion_id INT PRIMARY KEY AUTO_INCREMENT,
        challenge_id INT NOT NULL,
        user_id INT NOT NULL,
        details TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES WellnessChallenge(challenge_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    -- =====================
    -- GAMIFICATION TABLES
    -- =====================
    CREATE TABLE Team (
        team_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    CREATE TABLE PlayerCatalogue (
        catalogue_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50),
        description TEXT,
        position VARCHAR(20),
        rating INT DEFAULT 50,
        unlock_cost INT,
        image VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Player (
        player_id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT, -- can be NULL until unlocked
        catalogue_id INT NOT NULL,
        rating INT DEFAULT 50,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE SET NULL,
        FOREIGN KEY (catalogue_id) REFERENCES PlayerCatalogue(catalogue_id)
    );

    CREATE TABLE MatchRecord (
        match_id INT PRIMARY KEY AUTO_INCREMENT,
        home_team_id INT NOT NULL,
        away_team_id INT NOT NULL,
        home_score INT DEFAULT 0,
        away_score INT DEFAULT 0,
        winner_team_id INT, -- NULL for draw
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (home_team_id) REFERENCES Team(team_id),
        FOREIGN KEY (away_team_id) REFERENCES Team(team_id),
        FOREIGN KEY (winner_team_id) REFERENCES Team(team_id)
    );

    CREATE TABLE Badge (
        badge_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100),
        description TEXT,
        image VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE UserBadge (
        user_badge_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES Badge(badge_id),
        UNIQUE(user_id, badge_id)
    );

    -- =====================
    -- SAMPLE DATA
    -- =====================

    -- Users
    INSERT INTO User (username, email, password, points, streak_days, profile_pic, created_at, last_completed_at, last_login_at) VALUES
    ('superadmin', 'admin@example.com', '${hash}', 9999, 6, 'images/user.png', NOW(), NOW() - INTERVAL 1 DAY, NOW()), 
    ('heddy', 'heddy@example.com', '${hash}', 5000, 6, 'images/user.png', NOW(), NOW() - INTERVAL 1 DAY, NOW()),
    ('azim', 'azim@example.com', '${hash}', 50, 0, 'images/user.png', NOW(), NOW(), NOW()),
    ('tristan', 'tristan@example.com', '${hash}', 100, 30, 'images/user.png', NOW(), NOW() - INTERVAL 1 DAY, NOW()),
    ('rachel', 'rachel@example.com', '${hash}', 70, 0, 'images/user.png', NOW(), NOW(), NOW());
    -- Account icons created by Dwi ridwanto on Flaticon: https://www.flaticon.com/free-icons/account

    -- Teams
    INSERT INTO Team (user_id, name) VALUES
    (2, 'Red Devils'),
    (3, 'Blue Citizens'),
    (4, 'Golden Lions');

    -- Player Catalogue
    INSERT INTO PlayerCatalogue (name, description, position, rating, unlock_cost, image) VALUES
    -- Forwards
    ('Cristiano', 'Explosive goal scorer with elite movement and clinical finishing.', 'Forward', 90, 1520, 'images/cristiano.png'),
    ('Lionel', 'Creative attacker with tight control, quick turns, and precise final touch.', 'Forward', 90, 1520, 'images/lionel.png'),
    ('Luis', 'Aggressive striker who presses hard and finishes quickly in tight spaces.', 'Forward', 88, 1280, 'images/luis.png'),
    ('Kun', 'Sharp poacher with smart positioning and instinctive one-touch finishing.', 'Forward', 88, 1280, 'images/kun.png'),
    ('Eric', 'Strong, confident forward who can hold up play and create chances under pressure.', 'Forward', 88, 1280, 'images/eric.png'),
    ('Wayne', 'Powerful all-round forward who presses, links play, and scores from range.', 'Forward', 86, 1040, 'images/wayne.png'),
    ('Didier', 'Physical target forward who dominates aerial duels and scores big-game goals.', 'Forward', 86, 1040, 'images/didier.png'),
    ('Robin', 'Left-foot finisher with excellent first touch and deadly curl into the far corner.', 'Forward', 86, 1040, 'images/robin.png'),
    ('Gareth', 'Rapid wide forward who cuts inside and strikes cleanly from distance.', 'Forward', 86, 1040, 'images/gareth.png'),
    ('Fernando', 'Fast striker who times runs well and thrives on through balls in behind.', 'Forward', 84, 800, 'images/fernando.png'),
    ('Javier', 'Energetic striker who finds space in the box and finishes rebounds well.', 'Forward', 78, 490, 'images/javier.png'),
    ('Peter', 'Tall forward who wins headers, holds the ball up, and brings others into play.', 'Forward', 76, 430, 'images/peter.png'),
    ('Demba', 'Direct striker who shoots early and attacks near-post spaces.', 'Forward', 75, 400, 'images/demba.png'),
    ('Andy', 'Strong aerial striker who battles centre-backs and attacks crosses aggressively.', 'Forward', 73, 0, 'images/andy.png'),

    -- Midfielders
    ('Zizou', 'Elegant playmaker with elite first touch, vision, and composure in tight areas.', 'Midfielder', 89, 1400, 'images/zizou.png'),
    ('Andres', 'Press-resistant creator who unlocks defences with close control and quick passes.', 'Midfielder', 89, 1400, 'images/andres.png'),
    ('Dinho', 'Flair player with unpredictable dribbling and creative final balls.', 'Midfielder', 88, 1280, 'images/dinho.png'),
    ('Andrea', 'Deep-lying maestro who dictates tempo with long passing and calm distribution.', 'Midfielder', 88, 1280, 'images/andrea.png'),
    ('Luka', 'Complete midfielder who drives transitions and threads passes between lines.', 'Midfielder', 88, 1280, 'images/luka.png'),
    ('Steven', 'Leader in midfield with powerful shooting, long passes, and box-to-box energy.', 'Midfielder', 87, 1160, 'images/steven.png'),
    ('Yaya', 'Dominant midfielder who carries the ball forward and wins physical duels.', 'Midfielder', 87, 1160, 'images/yaya.png'),
    ('Roy', 'Hard-tackling captain type who reads danger early and sets the intensity.', 'Midfielder', 86, 1040, 'images/roy.png'),
    ('Paul', 'Midfield engine with sharp passing, clever movement, and late runs into the box.', 'Midfielder', 86, 1040, 'images/paul.png'),
    ('Frank', 'Goal-scoring midfielder with smart positioning and consistent long-range strikes.', 'Midfielder', 86, 1040, 'images/frank.png'),
    ('Ryan', 'Wide midfielder who controls possession, delivers quality crosses, and keeps tempo.', 'Midfielder', 86, 1040, 'images/ryan.png'),
    ('Becks', 'Set-piece specialist with accurate crossing and pinpoint long passing.', 'Midfielder', 85, 920, 'images/becks.png'),
    ('Labile', 'Technical midfielder with strength on the ball and line-breaking passes.', 'Midfielder', 85, 920, 'images/labile.png'),
    ('Park', 'Relentless runner who presses, covers space, and supports attacks intelligently.', 'Midfielder', 80, 550, 'images/park.png'),
    ('Michael', 'Calm holding midfielder who recycles possession and shields the defence.', 'Midfielder', 80, 550, 'images/michael.png'),
    ('Jack', 'Agile midfielder who dribbles through pressure and links short passes quickly.', 'Midfielder', 78, 490, 'images/jack.png'),
    ('Marouane', 'Physical midfielder who wins aerials and disrupts opponents with size and grit.', 'Midfielder', 78, 490, 'images/marouane.png'),
    ('Oscar', 'Attacking midfielder with quick turns, sharp pressing, and clever through balls.', 'Midfielder', 77, 0, 'images/oscar.png'),

    -- Defenders
    ('Paolo', 'World-class defender with perfect timing, positioning, and calm leadership.', 'Defender', 89, 1400, 'images/paolo.png'),
    ('Sergio', 'Aggressive defender who wins duels, attacks set pieces, and leads the backline.', 'Defender', 88, 1280, 'images/sergio.png'),
    ('Philipp', 'Modern full-back who reads the game well and supports attacks with stamina.', 'Defender', 88, 1280, 'images/philipp.png'),
    ('Nemanja', 'Commanding centre-back who dominates aerial battles and defends fearlessly.', 'Defender', 86, 1040, 'images/nemanja.png'),
    ('Rio', 'Composed ball-playing defender with strong anticipation and clean tackling.', 'Defender', 86, 1040, 'images/rio.png'),
    ('Carles', 'Tough organiser who blocks shots, wins headers, and keeps the defence together.', 'Defender', 86, 1040, 'images/carles.png'),
    ('Giorgio', 'Physical stopper who excels in 1v1 defending and last-ditch blocks.', 'Defender', 86, 1040, 'images/giorgio.png'),
    ('Vincent', 'Powerful leader at the back with strong tackling and aerial dominance.', 'Defender', 85, 920, 'images/vincent.png'),
    ('Jerome', 'Fast defender who covers space well and steps out to intercept passes.', 'Defender', 84, 800, 'images/jerome.png'),
    ('Jamie', 'No-nonsense defender who reads crosses well and stays disciplined under pressure.', 'Defender', 84, 800, 'images/jamie.png'),
    ('Gary', 'Reliable full-back with steady defending and accurate short passing.', 'Defender', 81, 580, 'images/gary.png'),
    ('Luiz', 'Risk-taking defender with strong tackling and confidence carrying the ball out.', 'Defender', 81, 580, 'images/luiz.png'),
    ('Phil', 'Energetic defender who challenges hard and can cover multiple defensive roles.', 'Defender', 76, 0, 'images/phil.png'),
    ('Wes', 'Solid squad defender who defends simply and stays compact in a low block.', 'Defender', 75, 0, 'images/wes.png'),

    -- Goalkeepers
    ('Manuel', 'Sweeper-keeper with quick reactions, brave rushing, and confident distribution.', 'Goalkeeper', 88, 1280, 'images/manuel.png'),
    ('Thibaut', 'Tall shot stopper with strong reach, handling, and big saves in tight angles.', 'Goalkeeper', 88, 1280, 'images/thibaut.png'),
    ('Gianluigi', 'Veteran leader with elite positioning, reflex saves, and command of the box.', 'Goalkeeper', 88, 1280, 'images/gianluigi.png'),
    ('Iker', 'Explosive reflex keeper who excels in 1v1s and close-range reactions.', 'Goalkeeper', 87, 1160, 'images/iker.png'),
    ('Petr', 'Reliable keeper with strong handling, smart positioning, and calm under pressure.', 'Goalkeeper', 86, 1040, 'images/petr.png'),
    ('Edwin', 'Composed goalkeeper with great reach and consistent decision-making.', 'Goalkeeper', 86, 1040, 'images/edwin.png'),
    ('David', 'Quick-reflex shot stopper with strong 1v1 saves and sharp footwork.', 'Goalkeeper', 86, 1040, 'images/david.png'),
    ('Joe', 'Athletic keeper with fast reactions and strong saves from distance.', 'Goalkeeper', 84, 800, 'images/joe.png'),
    ('Pepe', 'Experienced keeper with good positioning and steady distribution.', 'Goalkeeper', 81, 580, 'images/pepe.png'),
    ('Tim', 'Brave keeper who reacts quickly and performs well under heavy pressure.', 'Goalkeeper', 80, 550, 'images/tim.png'),
    ('Shay', 'Reliable shot stopper with sharp reflexes and confident catching.', 'Goalkeeper', 78, 0, 'images/shay.png');

    -- Players 
   INSERT INTO Player (team_id, catalogue_id, rating, unlocked_at) VALUES
    -- Team 1
    (1, 55, 81, NOW()),  -- Pepe (GK)
    (1, 43, 81, NOW()),  -- Gary (DEF)
    (1, 46, 75, NOW()),  -- Wes (DEF)
    (1, 28, 80, NOW()),  -- Park (MID)
    (1, 11, 78, NOW()),  -- Javier (FWD)

    -- Team 2
    (2, 56, 80, NOW()),  -- Tim (GK)
    (2, 44, 81, NOW()),  -- David L (DEF)
    (2, 45, 76, NOW()),  -- Phil J (DEF)
    (2, 29, 80, NOW()),  -- Michael (MID)
    (2, 12, 76, NOW()),  -- Peter (FWD)

    -- Team 3
    (3, 57, 78, NOW()),  -- Shay (GK)
    (3, 43, 81, NOW()),  -- Gary (DEF)
    (3, 45, 76, NOW()),  -- Phil J (DEF)
    (3, 30, 78, NOW()),  -- Jack (MID)
    (3, 14, 73, NOW());  -- Andy (FWD)

    -- Wellness Challenges
    INSERT INTO WellnessChallenge (creator_id, title, description, points, created_at) VALUES
    (1, 'Morning Hydration', 'Drink 200ml of water after waking up', 25, NOW()),
    (1, 'Stroll in the Park', 'Take a 15 minute walk', 50, NOW()),
    (1, 'Zen Moment', 'Meditate for 5 minutes', 35, NOW()),
    (1, 'Quick Stretch', 'Do a 2 minute full-body stretch', 25, NOW()),
    (1, 'Eye Break Reset', 'Follow the 20-20-20 rule once (20s, 20ft, every 20min)', 25, NOW()),
    (1, 'Take the Stairs', 'Use the stairs at least once today (instead of lift/escalator)', 35, NOW()),
    (1, 'After-Meal Walk', 'Take a 10 minute walk after a meal', 35, NOW()),
    (1, 'Snack Upgrade', 'Swap one snack for fruit or nuts', 35, NOW()),
    (1, 'No-Sugar Drink', 'Choose water/unsweetened tea instead of a sugary drink once', 35, NOW()),
    (1, 'Core Hold', 'Hold a plank for 30 seconds', 50, NOW()),
    (1, 'Sleep Wind-Down', 'No screens for 10 minutes before sleep', 25, NOW()),
    (1, 'Hydration Top-Up', 'Refill your water bottle once today', 25, NOW());

    -- User Completions
    INSERT INTO UserCompletion (challenge_id, user_id, details, completed_at) VALUES
    (1, 3, 'Completed in the morning', NOW()),
    (2, 3, 'Walked around the park', NOW());

    -- Badges
    INSERT INTO Badge (name, description, image, created_at) VALUES
    ('First Goal', 'Completed first wellness challenge', 'images/firstgoal.png', NOW()),
    ('Hat Trick', 'Completed 3 challenges in one day', 'images/hattrick.png', NOW()),
    ('Consistency King', 'Maintained a 7-day challenge streak', 'images/consistencyking.png', NOW()),
    ('World Class Player', 'Reach Player Rating 100', 'images/worldclassplayer.png', NOW()),
    ('Full Squad', 'Have at least 5 players in your team', 'images/fullsquad.png', NOW());

    -- User Badges
    INSERT INTO UserBadge (user_id, badge_id, awarded_at) VALUES
    (2, 1, NOW()),
    (1, 1, NOW()),
    (3, 1, NOW());
    `;

    // ##############################################################
    // RUN SQL STATEMENTS
    // ##############################################################
    pool.query(SQLSTATEMENT, (error, results, fields) => {
        if (error) {
            console.error("Error creating tables:", error);
        } else {
            console.log("Tables created successfully");
        }
        process.exit();
    });
}});
