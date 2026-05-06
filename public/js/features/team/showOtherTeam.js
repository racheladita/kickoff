document.addEventListener("DOMContentLoaded", function () {
    if (!checkSession()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('id');
    const token = localStorage.getItem("token");

    if (!teamId) {
        window.location.href = "matches.html";
        return;
    }

    // ========== FUNCTIONS ==========

    function fetchOwner(ownerId) {
        const callback = (status, user) => {
            if (status === 200) {
                document.getElementById("owner-info").innerHTML = `
                    <span>Manager: <strong class="text-white">${user.username}</strong></span>
                    <span class="mx-2">•</span>
                    <span>Member since: 2026</span>
                `;
            }
        };
        fetchMethod(currentUrl + "/api/users/" + ownerId, callback, "GET", null, token);
    }

    function fetchRoster() {
        const callback = (status, players) => {
            const grid = document.getElementById("roster-grid");
            const emptyState = document.getElementById("roster-empty-state");

            if (status === 200 && players && players.length > 0) {
                if (grid) {
                    grid.classList.remove("d-none");
                    grid.innerHTML = players.map(player => renderPlayerCard(player, "scout", { showCost: false })).join("");
                }
                if (emptyState) {
                    emptyState.classList.add("d-none");
                }
                loadTeamStats(teamId, "summary-player-count", "summary-avg-rating");
                updateLastMatchUI(teamId, "summary-last-match", "summary-match-date");
            } else {
                if (grid) {
                    grid.classList.add("d-none");
                }
                if (emptyState) {
                    emptyState.classList.remove("d-none");
                }
            }
        };
        fetchMethod(currentUrl + "/api/teams/" + teamId + "/players", callback, "GET", null, token);
    }

    // ========== INITIAL LOAD ==========
    const callbackForTeam = (status, team) => {
        if (status === 200 && team) {
            document.getElementById("display-team-name").textContent = team.team_name;
            
            fetchOwner(team.user_id);
            fetchRoster();

            document.getElementById("loading-state").classList.add("d-none");
            document.getElementById("team-info-section").classList.remove("d-none");
            document.getElementById("roster-section").classList.remove("d-none");
        } else {
            const message = `
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h3 class="text-white">Team Not Found</h3>
                    <p class="text-white opacity-75">This team might have been disbanded or the URL is incorrect.</p>
                </div>
            `;
            showMessage(message, "matches.html");
        }
    };
    fetchMethod(currentUrl + "/api/teams/" + teamId, callbackForTeam, "GET", null, token);
});
