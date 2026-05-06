document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get("id");

    if (!playerId) {
        showMessage("No player ID provided!", "market.html");
        return;
    }

    if (!token) {
        showMessage("Please login to view player details!", "login.html");
        return;
    }

    let currentPlayer = null;
    let userTeamId = null;
    let isOwned = false;
    let messageModal = null;

    // ========== CALLBACKS ==========

    function executeBuy() {
        const callback = (status, result) => {
            if (status === 200 || status === 201) {
                showBadgeEarned(result.badges, "Player bought successfully! Welcome to the club.", "market.html");
            } else {
                if (result.message) {
                    showMessage(result.message);
                } else {
                    showMessage("Failed to buy player.");
                }
            }
        };
        fetchMethod(currentUrl + "/api/players/" + playerId + "/unlock", callback, "POST", { team_id: userTeamId }, token);
    }

    function executeCheckBuyEligibility() {
        const callback = (uStatus, user) => {
            if (uStatus === 200) {
                if (user.points < currentPlayer.unlock_cost) {
                    const message = `
                        <div class="text-center">
                            <i class="fas fa-coins fa-3x text-warning mb-3"></i>
                            <h3 class="text-white">Insufficient Points</h3>
                            <p class="text-white opacity-75">You need <i class="fas fa-coins text-warning"></i> <strong>${formatPoints(currentPlayer.unlock_cost)}</strong> points to buy ${currentPlayer.name}.</p>
                            <p class="small text-white opacity-50 mt-2">Complete wellness challenges to earn more points!</p>
                        </div>
                    `;
                    showMessage(message, "challenges.html");
                    return;
                }

                if (!userTeamId) {
                    showMessage("You need a team first! Create one in your profile.", "profile.html");
                    return;
                }

                showPurchaseModal();
            }
        };
        fetchMethod(currentUrl + "/api/users/" + userId, callback, "GET", null, token);
    }

    function executeDeletePlayer() {
        const callback = (status, result) => {
            if (status === 204 || status === 200) {
                showMessage("Player deleted!", "market.html");
            } else {
                if (result.message) {
                    showMessage(result.message);
                } else {
                    showMessage("Failed to delete player.");
                }
            }
        };
        fetchMethod(currentUrl + "/api/catalogue/" + playerId, callback, "DELETE", null, token);
    }

    function fetchPlayerDetails() {
        const source = urlParams.get("source");
        let apiPath = "/api/catalogue/";
        if (source === "team") {
            apiPath = "/api/players/";
        }
        
        const callback = (status, player) => {
            if (status === 200 && player) {
                currentPlayer = player;
                
                document.getElementById("loading-state").classList.add("d-none");
                document.getElementById("player-details").classList.remove("d-none");
                
                document.getElementById("player-name").textContent = player.name;
                document.getElementById("player-position").textContent = player.position;
                document.getElementById("player-rating").textContent = player.rating;
                document.getElementById("player-cost").textContent = player.unlock_cost;
                document.getElementById("player-description").textContent = player.description;
                
                let imageUrl = player.image;
                if (!imageUrl) {
                    imageUrl = player.player_image;
                }
                if (imageUrl) {
                    document.getElementById("player-img").src = imageUrl;
                }

                // check ownership after loading details
                if (!userId || !token) {
                    renderActionButtons(false);
                } else {
                    fetchUserTeam();
                }
            } else {
                const message = `
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h3 class="text-white">Player Not Found</h3>
                        <p class="text-white opacity-75">This player might have been removed from the catalogue.</p>
                    </div>
                `;
                showMessage(message, "market.html");
            }
        };

        fetchMethod(currentUrl + apiPath + playerId, callback, "GET", null, token);
    }

    function fetchUserTeam() {
        const callback = (status, team) => {
            if (status === 200 && team && team.team_id) {
                userTeamId = team.team_id;
                fetchTeamRoster(team.team_id);
            } else {
                renderActionButtons(false);
            }
        };
        fetchMethod(currentUrl + "/api/teams/user/" + userId, callback, "GET", null, token);
    }

    function fetchTeamRoster(teamId) {
        const callback = (pStatus, players) => {
            const source = urlParams.get("source");
            if (pStatus === 200 && players) {
                if (source === "team") {
                    isOwned = players.some(player => Number(player.player_id) === Number(playerId));
                } else {
                    isOwned = players.some(player => Number(player.catalogue_id) === Number(playerId));
                }
                renderActionButtons(isOwned);
            } else {
                renderActionButtons(false);
            }
        };
        fetchMethod(currentUrl + "/api/teams/" + teamId + "/players", callback, "GET", null, token);
    }

    function showPurchaseModal() {
        if (!messageModal) {
            messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
        }
        
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <p class="mb-3">Are you sure you want to buy <strong>${currentPlayer.name}</strong>?</p>
            <div class="d-flex justify-content-center gap-3 align-items-center">
                <span class="text-gray">Cost:</span>
                <span class="fw-bold text-white"><i class="fas fa-coins text-warning"></i> ${currentPlayer.unlock_cost}</span>
            </div>
        `;
        
        const modalFooter = document.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-pink" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-white" id="confirm-buy-btn-modal">Confirm</button>
        `;
        
        document.getElementById('confirm-buy-btn-modal').onclick = () => {
            messageModal.hide();
            executeBuy();
        };
        
        messageModal.show();
    }

    function renderActionButtons(owned) {
        const source = urlParams.get("source");
        const container = document.getElementById("action-buttons-container");
        let isAdmin = false;
        if (Number(userId) === 1) {
            isAdmin = true;
        }
        
        if (!token) {
            container.innerHTML = '<a href="login.html" class="btn btn-dark">Login to Buy</a>';
            return;
        }

        const statusText = document.getElementById("player-status-text");
        if (statusText) {
            if (owned) {
                statusText.textContent = "Signed";
            } else {
                statusText.textContent = "Available";
            }
        }

        let buttonsHtml = "";

        if (owned) {
            const refund = Math.floor(currentPlayer.unlock_cost * 0.5);
            buttonsHtml += `
                <div class="d-flex flex-column gap-2 w-100">
                    <button class="btn btn-disabled w-100" disabled>
                        <i class="fas fa-check-circle"></i> Owned
                    </button>
            `;

            if (source === "team") {
                buttonsHtml += `
                    <button onclick="confirmSellPlayerFromDetails()" class="btn btn-delete-red w-100 justify-content-center">
                        Sell <i class="fas fa-coins text-warning"></i> ${formatPoints(refund)} Points
                    </button>
                `;
            }
            buttonsHtml += `</div>`;
        } else {
            buttonsHtml += `
                <button id="buy-btn" class="btn btn-secondary justify-content-center" onclick="confirmBuy()">
                    <i class="fas fa-shopping-cart"></i> Buy Player
                </button>
            `;
        }

        if (isAdmin && source !== "team") {
            buttonsHtml += `
                <div class="d-flex gap-2 w-100">
                    <button class="btn btn-outline-light flex-grow-1" onclick="showEditPlayerForm()"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-delete-red flex-grow-1" onclick="confirmDeletePlayer()"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            container.classList.add("flex-column");
            container.classList.remove("align-items-center");
        }

        container.innerHTML = buttonsHtml;
    }

    // ========== WINDOW GLOBALS (UI CALLABLE) ==========

    window.showEditPlayerForm = function() {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `editPlayer.html?id=${playerId}&returnUrl=${returnUrl}`;
    };

    window.confirmDeletePlayer = function() {
        showConfirm("Are you sure you want to delete this player from the catalogue?", function() {
            executeDeletePlayer();
        });
    };

    window.confirmBuy = function() {
        if (currentPlayer) {
            executeCheckBuyEligibility();
        }
    };

    window.confirmSellPlayerFromDetails = function() {
        if (!currentPlayer) {
            return;
        }
        const refund = Math.floor(currentPlayer.unlock_cost * 0.5);
        let pId = playerId;
        if (urlParams.get("source") !== "team") {
            pId = currentPlayer.player_id;
        }

        showConfirm(`Are you sure you want to sell ${currentPlayer.name} for <i class="fas fa-coins text-warning"></i> ${formatPoints(refund)} points?`, function() {
            executeSellPlayer(pId, currentPlayer.name, refund, function() {
                if (urlParams.get("source") === "team") {
                    window.location.href = "team.html"; 
                } else {
                    window.location.href = "market.html";
                }
            });
        });
    };

    // ========== INITIAL LOAD ==========
    fetchPlayerDetails();
});
