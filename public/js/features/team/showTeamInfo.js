document.addEventListener("DOMContentLoaded", function () {
    if (!checkSession()) {
        return;
    }

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (typeof checkAuth === "function") {
        checkAuth();
    }

    // ========== LOAD ROSTER ==========
    function loadRoster(teamId) {
        // Define callback first
        const callbackForRoster = (status, players) => {
            const grid = document.getElementById("roster-grid");
            const emptyState = document.getElementById("roster-empty-state");
            
            if (status === 200 && players && players.length > 0) {
                if (grid) {
                    grid.classList.remove("d-none");
                    grid.innerHTML = players.map(player => renderPlayerCard(player, "roster", { showActions: true, showCost: false })).join("");
                }
                if (emptyState) {
                    emptyState.classList.add("d-none");
                }
            } else {
                if (grid) {
                    grid.classList.add("d-none");
                }
                if (emptyState) {
                    emptyState.classList.remove("d-none");
                }
            }
        };

        // Fetch roster data
        fetchMethod(currentUrl + "/api/teams/" + teamId + "/players", callbackForRoster, "GET", null, token);
    }

    // ========== PLAYER INFO MODAL ==========
    // Use window to make function global so it can be called from HTML onclick
    window.viewPlayerInfo = function(name, rating, refund) {
        const message = `
            <div class="text-start">
                <p><strong>Player:</strong> ${name}</p>
                <p><strong>Rating:</strong> ${rating} <i class="fas fa-star text-warning"></i></p>
                <p><strong>Sell Value:</strong> ${formatPoints(refund)} PTS</p>
                <p class="small text-white opacity-75 mt-2"><i class="fas fa-info-circle"></i> Players can be sold for 50% of their market value.</p>
            </div>
        `;
        showMessage(message);
    };

    // ========== SELL PLAYER ==========
    // Use window to make function global so it can be called from HTML onclick
    window.confirmSellPlayer = function(playerId, name, refund) {
        showConfirm(`Are you sure you want to sell ${name} for <i class="fas fa-coins text-warning"></i> ${formatPoints(refund)} points?`, function() {
            executeSellPlayer(playerId, name, refund, loadTeam);
        });
    };

    // ========== LOAD TEAM SUMMARY ==========
    function loadTeamSummary(teamId) {
        loadTeamStats(teamId, "summary-player-count", "summary-avg-rating");
        updateLastMatchUI(teamId, "summary-last-match", "summary-match-date");
    }

    // ========== LOAD TEAM ==========
    function loadTeam() {
        const loadingState = document.getElementById("loading-state");
        const emptyState = document.getElementById("empty-state");
        const teamInfo = document.getElementById("team-info");
        const rosterSection = document.getElementById("roster-section");

        const callbackForTeam = (status, team) => {
            if (loadingState) {
                loadingState.classList.add("d-none");
            }

            if (status === 200) {
                if (emptyState) {
                    emptyState.classList.remove("d-none");
                }
                if (team && team.team_id) {
                    emptyState.classList.add("d-none");
                    if (teamInfo) {
                        teamInfo.classList.remove("d-none");
                    }
                    if (rosterSection) {
                        rosterSection.classList.remove("d-none");
                    }
                    const teamNameEl = document.getElementById("display-team-name");
                    if (teamNameEl) {
                        teamNameEl.textContent = team.team_name;
                    }

                    loadRoster(team.team_id);
                    loadTeamSummary(team.team_id);
                }
            } else {
                handleApiError(status, team, "Error loading team data");
            }
        };

        // Fetch team data
        fetchMethod(currentUrl + "/api/teams/user/" + userId, callbackForTeam, "GET", null, token);
    }

    // ========== INITIAL LOAD ==========
    loadTeam();
});
