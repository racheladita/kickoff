// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require("../services/db");

// ##############################################################
// DEFINE SQL STATEMENTS
// ##############################################################
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
    last_completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

CREATE TABLE WellnessChallenge (
    challenge_id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id INT NOT NULL,
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
INSERT INTO User (username, email, password, points, created_at, last_login_at) VALUES
('superadmin', 'admin@example.com', 'adminpass', 9999, NOW(), NOW()),
('heddy', 'heddy@example.com', 'password', 100, NOW(), NOW()),
('azim', 'azim@example.com', 'password', 50, NOW(), NOW()),
('tristan', 'tristan@example.com', 'password', 30, NOW(), NOW()),
('rachel', 'rachel@example.com', 'password', 70, NOW(), NOW());

-- Teams
INSERT INTO Team (user_id, name) VALUES
(2, 'Red Devils'),
(3, 'Blue Citizens'),
(4, 'Golden Lions');

-- Player Catalogue
INSERT INTO PlayerCatalogue (name, description, position, rating, unlock_cost) VALUES
('Cristiano', 'Legendary striker', 'Forward', 85, 500),
('Wayne', 'Powerhouse forward', 'Forward', 82, 600),
('Paul', 'Midfield engine', 'Midfielder', 78, 300),
('David', 'Shot stopper', 'Goalkeeper', 75, 200),
('Nemanja', 'Solid rock', 'Defender', 77, 250);

-- Players 
INSERT INTO Player (team_id, catalogue_id, rating, unlocked_at) VALUES
(1, 1, 65, NOW()),
(1, 2, 60, NOW()),
(3, 3, 55, NOW()),
(2, 4, 50, NOW()),
(1, 5, 45, NOW());

-- Wellness Challenges
INSERT INTO WellnessChallenge (creator_id, description, points, created_at) VALUES
(1, 'Drink 200ml of water after waking up', 10, NOW()),
(1, 'Take a 15 minute walk', 20, NOW()),
(1, 'Meditate for 5 minutes', 15, NOW());

-- User Completions
INSERT INTO UserCompletion (challenge_id, user_id, details, completed_at) VALUES
(1, 2, 'Completed in the morning', NOW()),
(2, 3, 'Walked around the park', NOW());

-- Badges
INSERT INTO Badge (name, description, created_at) VALUES
('First Goal', 'Completed first wellness challenge', NOW()),
('Hat Trick', 'Completed 3 challenges in one day', NOW()),
('Consistency King', 'Maintained a 7-day challenge streak', NOW()),
('Elite Striker', 'Reach Player Rating 75', NOW()),
('Full Squad', 'Have at least 5 players in your team', NOW());

-- User Badges
INSERT INTO UserBadge (user_id, badge_id, awarded_at) VALUES
(2, 1, NOW());
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
