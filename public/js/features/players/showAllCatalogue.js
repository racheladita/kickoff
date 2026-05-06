document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    // ========== STATE ==========
    let allCatalogue = [];
    let allOwnedPlayerIds = [];
    let currentPlayerPoints = 0;
    let marketCurrentPage = 1;
    const marketLimit = 6;

    // ========== CALLBACKS ==========

    // Callback for initial catalogue load
    const callbackForCatalogue = (status, catalogue) => {
        if (status === 200) {
            allCatalogue = catalogue;
            if (userId && token) {
                fetchUserTeam();
            } else {
                // Guest mode: just render the catalogue
                renderMarket();
            }
        } else {
            allCatalogue = [];
            renderMarket();
        }
    };

    // Callback for unlocking/buying a player
    const callbackForUnlock = (bStatus, buyResult) => {
        if (bStatus === 200 || bStatus === 201) {
            if (buyResult.badges && buyResult.badges.length > 0) {
                showBadgeEarned(buyResult.badges, "Player bought successfully! Welcome to the club.");
            } else {
                showMessage("Player bought successfully! Welcome to the club.");
            }
            // Reload market
            fetchMethod(currentUrl + "/api/catalogue", callbackForCatalogue, "GET", null, token);
        } else {
            showMessage(buyResult.message || "Failed to buy player.");
        }
    };

    // ========== FUNCTIONS ==========

    function fetchUserTeam() {
        const callback = (tStatus, teamData) => {
            if (tStatus === 200 && teamData && teamData.team_id) {
                fetchTeamPlayers(teamData.team_id);
            } else {
                // No team or error, render market with no owned players
                allOwnedPlayerIds = [];
                renderMarket();
            }
        };
        fetchMethod(currentUrl + "/api/teams/user/" + userId, callback, "GET", null, token);
    }

    function fetchTeamPlayers(teamId) {
        const callback = (pStatus, players) => {
            if (pStatus === 200 && players) {
                allOwnedPlayerIds = players.map(player => Number(player.catalogue_id));
            } else {
                allOwnedPlayerIds = [];
            }
            fetchUserPoints();
        };
        fetchMethod(currentUrl + "/api/teams/" + teamId + "/players", callback, "GET", null, token);
    }

    function fetchUserPoints() {
        const callback = (pStatus, user) => {
            if (pStatus === 200) {
                currentPlayerPoints = user.points;
                const ptsEl = document.getElementById("nav-user-points");
                if (ptsEl) {
                    ptsEl.textContent = formatPoints(user.points);
                }
            }
            renderMarket();
        };
        fetchMethod(currentUrl + "/api/users/" + userId, callback, "GET", null, token);
    }

    function renderMarket() {
        const grid = document.getElementById("market-grid");

        if (!allCatalogue || allCatalogue.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-white opacity-75">No players available in the market right now. Check back later!</p></div>';
            return;
        }

        // Apply Pagination
        const pagedCatalogue = paginateArray(allCatalogue, marketCurrentPage, marketLimit);
        
        // Guest mode
        if (!userId || !token) {
            grid.innerHTML = pagedCatalogue
                .map((item) => `<div class="col">${renderPlayerCard(item, "market", { isOwned: false, canAfford: false, showActions: false })}</div>`)
                .join("");
            
            renderPager("market-pager", allCatalogue.length, marketCurrentPage, marketLimit, "changeMarketPage");
            return;
        }

        grid.innerHTML = pagedCatalogue
            .map((item) => {
                let isOwned = false;
                if (allOwnedPlayerIds.includes(Number(item.catalogue_id))) {
                    isOwned = true;
                }
                
                let canAfford = false;
                if (currentPlayerPoints >= item.unlock_cost) {
                    canAfford = true;
                }

                return `<div class="col">${renderPlayerCard(item, "market", { isOwned, canAfford })}</div>`;
            })
            .join("");

        renderPager("market-pager", allCatalogue.length, marketCurrentPage, marketLimit, "changeMarketPage");
    }

    // Global function for pager to call
    window.changeMarketPage = function(newPage) {
        marketCurrentPage = newPage;
        renderMarket();
        // Scroll to top of grid for better UX
        document.getElementById("market-grid").scrollIntoView({ behavior: 'smooth' });
    };

    // ========== WINDOW GLOBALS (UI CALLABLE) ==========

    window.confirmBuyPlayer = function(id, cost, name) {
        const confirmMsg = `
            <p class="mb-3">Are you sure you want to buy <strong>${name}</strong>?</p>
            <div class="d-flex justify-content-center gap-3 align-items-center">
                <span class="text-gray">Cost:</span>
                <span class="fw-bold text-white"><i class="fas fa-coins text-warning"></i> ${cost}</span>
            </div>
        `;
        
        showConfirm(confirmMsg, function() {
            executeBuy(id, cost);
        });
    };

    window.executeBuy = function(catalogueId, cost) {
        if (!userId || !token) {
            showMessage("Please login to build your team!", "login.html");
            return;
        }

        const callback = (status, result) => {
            if (status === 200 && result && result.team_id) {
                const teamId = result.team_id;
                fetchMethod(currentUrl + "/api/players/" + catalogueId + "/unlock", callbackForUnlock, "POST", { team_id: teamId }, token);
            } else {
                showMessage("Please create a team first!", "profile.html");
            }
        };

        fetchMethod(currentUrl + "/api/teams/user/" + userId, callback, "GET", null, token);
    };

    // ========== INITIAL LOAD ==========
    fetchMethod(currentUrl + "/api/catalogue", callbackForCatalogue, "GET", null, token);
});
