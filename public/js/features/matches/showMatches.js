// Loading match animation
const showLoadingAnimation = () => {
    const overlay = document.getElementById("match-loading-overlay");
    const countdown = document.getElementById("loading-countdown");
    const progressBar = document.getElementById("loading-progress-bar");
    
    progressBar.style.animation = 'none';
    progressBar.offsetHeight; // Trigger reflow, force browser to restart animation
    progressBar.style.animation = 'progressFill 5s linear forwards';
    overlay.classList.add("active");
    
    let count = 5;
    countdown.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count;
        } else {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    return countdownInterval;
};

// Hide loading match animation
const hideLoadingAnimation = () => {
    const overlay = document.getElementById("match-loading-overlay");
    overlay.classList.add("fade-out");
    setTimeout(() => {
        overlay.classList.remove("active", "fade-out");
    }, 400);
};

// Main Logic
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    // ========== FUNCTIONS ==========

    function refreshGlobalHistory() {
        const callback = (status, matches) => {
            const list = document.getElementById("global-history-list");
            if (status === 200 && matches.length > 0) {
                list.innerHTML = matches.map(match => renderMatchCard(match)).join("");
            } else {
                list.innerHTML = '<p class="text-muted text-center py-4">No community matches yet.</p>';
            }
        };
        fetchMethod(currentUrl + "/api/matches/history", callback, "GET", null, token);
    }

    function fetchTeamHistory() {
        if (!token || !userId) {
            const tabWrapper = document.getElementById("my-battles-tab-wrapper");
            if (tabWrapper) {
                tabWrapper.classList.add("d-none");
            }
            return;
        }

        const callback = (status, teamData) => {
            if (status === 200 && teamData && teamData.team_id) {
                fetchTeamMatches(teamData.team_id);
            } else {
                const teamHistoryList = document.getElementById("team-history-list");
                if (teamHistoryList) {
                    teamHistoryList.innerHTML = '<p class="text-muted text-center py-4">Create a team to track your battles!</p>';
                }
            }
        };
        fetchMethod(currentUrl + "/api/teams/user/" + userId, callback, "GET", null, token);
    }

    function fetchTeamMatches(teamId) {
        const callback = (status, matches) => {
            const teamHistoryList = document.getElementById("team-history-list");
            if (status === 200 && matches.length > 0) {
                teamHistoryList.innerHTML = matches.map(match => renderMatchCard(match)).join("");
            } else {
                teamHistoryList.innerHTML = '<p class="text-muted text-center py-4">You haven\'t played any matches yet.</p>';
            }
        };
        fetchMethod(currentUrl + "/api/matches/history/" + teamId, callback, "GET", null, token);
    }

    function fetchTeamStats() {
        if (!token || !userId) {
            const statsContent = document.getElementById("team-stats-content");
            if (statsContent) {
                statsContent.innerHTML = '<p class="text-muted">Play matches to see your stats!</p>';
            }
            return;
        }

        const callback = (status, teamData) => {
            if (status === 200 && teamData && teamData.team_id) {
                fetchStatsData(teamData.team_id);
            } else {
                const statsContent = document.getElementById("team-stats-content");
                if (statsContent) {
                    statsContent.innerHTML = '<p class="text-muted">Create a team to see your stats!</p>';
                }
            }
        };
        fetchMethod(currentUrl + "/api/teams/user/" + userId, callback, "GET", null, token);
    }

    function fetchStatsData(teamId) {
        const callback = (status, stats) => {
            const statsContent = document.getElementById("team-stats-content");
            if (status === 200 && stats) {
                const total = stats.matches_played || 0;
                const wins = stats.wins || 0;
                const losses = stats.losses || 0;
                const draws = stats.draws || 0;
                let winRate = 0;
                if (total > 0) {
                    winRate = Math.round((wins / total) * 100);
                }
                
                statsContent.innerHTML = `
                  <div class="d-flex flex-column gap-2 text-muted">
                    <div class="d-flex justify-content-between"><span>Total Matches</span><span class="fw-bold text-white">${total}</span></div>
                    <div class="d-flex justify-content-between"><span>Wins</span><span class="fw-bold text-success">${wins}</span></div>
                    <div class="d-flex justify-content-between"><span>Losses</span><span class="fw-bold text-danger">${losses}</span></div>
                    <div class="d-flex justify-content-between"><span>Draws</span><span class="fw-bold text-warning">${draws}</span></div>
                    <div class="d-flex justify-content-between"><span>Win Rate</span><span class="fw-bold text-pink">${winRate}%</span></div>
                  </div>`;
            } else {
                statsContent.innerHTML = '<p class="text-muted">Play matches to see your stats!</p>';
            }
        };
        fetchMethod(currentUrl + "/api/matches/stats/" + teamId, callback, "GET", null, token);
    }

    function handleMatch(btn) {
        if (!token || !userId) {
            return showMessage("Please login to compete!", "login.html");
        }

        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Opponent...';

        const callback = (status, team) => {
            if (status === 200 && team && team.team_id) {
                executeMatchSequence(team.team_id, btn, originalText);
            } else {
                showMessage("Please create a team first!", "profile.html");
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        };
        fetchMethod(currentUrl + "/api/teams/user/" + userId, callback, "GET", null, token);
    }

    function executeMatchSequence(teamId, btn, originalText) {
        let matchResult = null;
        let matchStatus = null;
        let animationDone = false;
        let apiDone = false;

        const handleMatchResultDisplay = () => {
            btn.disabled = false;
            btn.innerHTML = originalText;

            const resultSection = document.getElementById("match-result");
            const resultText = document.getElementById("result-text");
            const summary = document.getElementById("match-summary");

            if (resultSection) {
                resultSection.classList.remove("d-none");
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            if (matchStatus === 200 && matchResult) {
                const data = matchResult.match_result;
                if (resultText) {
                    if (data.home_score > data.away_score) {
                        resultText.textContent = "🎉 Victory!";
                        resultText.className = "result-victory text-success";
                    } else if (data.home_score < data.away_score) {
                        resultText.textContent = "😢 Defeat";
                        resultText.className = "result-defeat text-danger";
                    } else {
                        resultText.textContent = "🤝 Draw";
                        resultText.className = "result-draw text-warning";
                    }
                }

                if (summary) {
                    summary.innerHTML = `
                        <div class="h1 text-white">
                            ${data.home_score} - ${data.away_score}
                        </div>
                        <p>${data.home_team_name} vs ${data.away_team_name}</p>
                    `;
                }

                // Refresh all sections after match
                refreshGlobalHistory();
                fetchTeamHistory();
                fetchTeamStats();
                loadLeaderboardUI("leaderboard-list");
                if (window.updateNavPoints) {
                    window.updateNavPoints();
                }
                
                if (matchResult.badges && matchResult.badges.length > 0) {
                    setTimeout(() => showBadgeEarned(matchResult.badges, "Great performance!"), 1000);
                }
            } else {
                if (matchResult) {
                    showMessage("Matchmaking failed: " + matchResult.message);
                } else {
                    showMessage("Matchmaking failed: No opponents available.");
                }
            }
        };

        const processResult = () => {
            if (!animationDone || !apiDone) {
                return;
            }
            hideLoadingAnimation();
            setTimeout(() => {
                handleMatchResultDisplay();
            }, 400); // Match the fade-out duration
        };

        // 1. Start Animation
        showLoadingAnimation();
        setTimeout(() => {
            animationDone = true;
            processResult();
        }, 5000);

        // 2. Start API (Parallel)
        const callback = (status, result) => {
            matchStatus = status;
            matchResult = result;
            apiDone = true;
            processResult();
        };
        fetchMethod(currentUrl + "/api/matches/match", callback, "POST", { home_team_id: teamId }, token);
    }

    // ========== EVENT HANDLERS ==========

    const startBtn = document.getElementById("start-match-hero-btn");
    if (startBtn) {
        startBtn.onclick = function() {
            handleMatch(this);
        };
    }

    // ========== INITIAL LOAD ==========
    refreshGlobalHistory();
    fetchTeamHistory();
    fetchTeamStats();
    
    const callbackDiscovery = (status, teams) => {
        const grid = document.getElementById("discovery-grid");
        if (status === 200 && teams.length > 0) {
            let filteredTeams = teams;
            if (userId) {
                filteredTeams = teams.filter(team => team.user_id != userId);
            }
            const others = filteredTeams.slice(0, 6);

            if (others.length === 0) {
                grid.innerHTML = '<p class="text-white opacity-50">No other teams found yet.</p>';
                return;
            }

            grid.innerHTML = others.map(team => {
                let scoutButton = '';
                if (token) {
                    scoutButton = `<button onclick="window.location.href='otherTeam.html?id=${team.team_id}'" class="btn btn-outline-light my-2">Scout Team</button>`;
                }

                return `
                    <div class="col-md-4 w-100 p-2">
                        <div class="card glass text-center p-3 h-100">
                            <i class="fas fa-shield-alt fa-2x mb-2 text-primary"></i>
                            <h5 class="text-white">${team.team_name}</h5>
                            ${scoutButton}
                        </div>
                    </div>`;
            }).join("");
        } else {
            if (grid) grid.innerHTML = '<p class="text-white opacity-50">Exploring the league...</p>';
        }
    };
    fetchMethod(currentUrl + "/api/teams", callbackDiscovery, "GET", null, token);
    loadLeaderboardUI("leaderboard-list");
});
