// 1. Format and Display Last Match UI
function updateLastMatchUI(teamId, matchElId, dateElId = "summary-match-date") {
    const token = localStorage.getItem("token");
    const matchEl = document.getElementById(matchElId);
    if (!matchEl) {
        return;
    }

    const callback = (status, matches) => {
        if (status === 200 && matches && matches.length > 0) {
            const lastMatch = matches[0];
            const vsText = `${lastMatch.home_name} vs ${lastMatch.away_name}`;
            const score = `${lastMatch.home_score} - ${lastMatch.away_score}`;
            const date = formatDate(lastMatch.played_at);
            
            matchEl.innerHTML = `<span class="text-white fw-bold">${vsText}</span> <br> <span class="text-pink fw-bold">${score}</span>`;
            
            const dateEl = document.getElementById(dateElId);
            if (dateEl) {
                dateEl.innerText = `(${date})`;
            }
        } else {
            matchEl.textContent = "No matches yet";
        }
    };

    fetchMethod(currentUrl + "/api/matches/history/" + teamId, callback, "GET", null, token);
}

// 2. Load Team Statistics (Squad Size, Avg Rating)
function loadTeamStats(teamId, countElId, ratingElId) {
    const token = localStorage.getItem("token");
    
    const callback = (status, players) => {
        if (status === 200 && players) {
            const count = players.length;
            let totalRating = 0;
            for (let i = 0; i < players.length; i++) {
                totalRating += players[i].rating;
            }

            let avgRating = 0;
            if (count > 0) {
                avgRating = (totalRating / count).toFixed(1);
            }
            
            const countEl = document.getElementById(countElId);
            const ratingEl = document.getElementById(ratingElId);
            
            if (countEl) {
                countEl.textContent = count;
            }
            if (ratingEl) {
                ratingEl.textContent = avgRating;
            }
        }
    };

    fetchMethod(currentUrl + "/api/teams/" + teamId + "/players", callback, "GET", null, token);
}

// 3. Render a Standard Player Card (Unified for Roster, Market, and Scout)
function renderPlayerCard(player, mode = "scout", options = {}) {
    const refund = Math.floor(player.unlock_cost * 0.5);
    let showActions = true;
    if (options.showActions === false) {
        showActions = false;
    }
    
    let showCost = true;
    if (options.showCost === false) {
        showCost = false;
    }
    
    let actionsHtml = '';
    if (showActions) {
        if (mode === "roster") {
            actionsHtml = `
                <div class="d-flex flex-column gap-2 mt-2">
                    <a href="playerDetails.html?id=${player.player_id}&source=team" class="btn btn-outline-light d-flex align-items-center justify-content-center gap-2">
                        <i class="fas fa-info-circle"></i> View Details
                    </a>
                    <button onclick="confirmSellPlayer(${player.player_id}, '${player.name}', ${refund})" class="btn btn-delete-red">
                        <i class="fas fa-coins"></i> Sell
                    </button>
                </div>
            `;
        } else if (mode === "market") {
            const isOwned = options.isOwned;
            const canAfford = options.canAfford;
            
            let buyButton;
            if (isOwned) {
                buyButton = `<button class="btn btn-disabled form-submit mt-2 w-100" disabled><i class="fas fa-shopping-cart"></i> Owned</button>`;
            } else if (!canAfford) {
                buyButton = `<button class="btn btn-delete-red form-submit mt-2 w-100" disabled><i class="fas fa-shopping-cart"></i> Too Expensive</button>`;
            } else {
                buyButton = `<button onclick="confirmBuyPlayer(${player.catalogue_id}, ${player.unlock_cost}, '${player.name}')" class="btn btn-secondary form-submit mt-2 w-100"><i class="fas fa-shopping-cart"></i> Buy Player</button>`;
            }
            
            actionsHtml = `
                <div class="d-flex flex-column gap-1 mt-2">
                    ${buyButton}
                    <a href="playerDetails.html?id=${player.catalogue_id}" class="btn btn-outline-light mt-1 w-100"><i class="fas fa-info-circle"></i> View Details</a>
                </div>
            `;
        }
    }

    let costHtml = '';
    if (showCost) {
        costHtml = `
            <span class="stats-highlight"><i class="fas fa-coins text-warning"></i> ${player.unlock_cost}</span>
        `;
    }

    // Default image if missing.
    let imagePath = "images/cristiano.png";
    if (player.image) {
        imagePath = player.image;
    }

    return `
        <div class="card glass card-center h-100 p-4 text-center text-white">
            <img src="${imagePath}" class="catalogue-img mb-2">
            <h3 class="fw-bold mb-1">${player.name}</h3>
            <p class="small text-white text-opacity-75 mb-3">${player.position}</p>
            <div class="item-stats d-flex gap-3 justify-content-center">
                <span><i class="fas fa-star text-warning"></i> ${player.rating}</span>
                ${costHtml}
            </div>
            ${actionsHtml}
        </div>
    `;
}

// 4. Render a Standard Match Case
function renderMatchCard(match) {
    const playedAt = formatDate(match.played_at);
    return `
        <div class="card glass p-3 mb-2">
            <div class="row align-items-center text-white g-0 w-100">
                <div class="col text-end pe-3 pe-md-4">
                    <span class="fw-medium">${match.home_name}</span>
                </div>
                <div class="col-auto">
                    <span class="match-score-badge px-4 py-2 rounded-pill fw-bold">${match.home_score} - ${match.away_score}</span>
                </div>
                <div class="col text-start ps-3 ps-md-4">
                    <span class="fw-medium">${match.away_name}</span>
                </div>
            </div>
            <div class="text-center mt-2">
                <small class="text-white text-opacity-50 fs-xs">${playedAt}</small>
            </div>
        </div>
    `;
}

// 5. Load Leaderboard UI
function loadLeaderboardUI(listElId) {
    const token = localStorage.getItem("token");
    const list = document.getElementById(listElId);
    if (!list) {
        return;
    }

    const callback = (status, leaders) => {
        if (status === 200 && leaders.length > 0) {
            list.innerHTML = leaders.map((leader, index) => {
                let rankClass = "";
                if (index < 3) {
                    rankClass = "bg-purple-light rounded";
                }

                let nameClass = "text-muted";
                if (index === 0) {
                    nameClass = "text-warning";
                }

                return `
                    <div class="border-bottom border-1 d-flex justify-content-between align-items-center mb-2 p-2 ${rankClass}">
                        <div class="d-flex align-items-center text-white gap-2">
                            <span class="fw-bold ${nameClass}">#${index + 1}</span>
                            <span class="fw-bold">${leader.name}</span>
                        </div>
                        <span class="badge bg-primary">${leader.wins} W</span>
                    </div>
                `;
            }).join("");
        } else {
            list.innerHTML = '<p class="text-muted">No teams found.</p>';
        }
    };

    fetchMethod(currentUrl + "/api/matches/leaderboard", callback, "GET", null, token);
}

// 6. Centralized Player Selling Logic
function executeSellPlayer(playerId, name, refund, onSuccess) {
    const token = localStorage.getItem("token");
    const callback = (status, result) => {
        if (status === 200) {
            showMessage(`${name} has been sold for <i class="fas fa-coins text-warning"></i> ${formatPoints(refund)} points!`);
            
            if (typeof window.updateNavPoints === "function") {
                window.updateNavPoints();
            }

            const okBtn = document.getElementById('message-ok-btn');
            if (okBtn && onSuccess) {
                okBtn.onclick = () => {
                    if (globalMessageModal) {
                        globalMessageModal.hide();
                    }
                    onSuccess();
                };
            }
        } else {
            handleApiError(status, result, "Error selling player");
        }
    };
    fetchMethod(currentUrl + "/api/players/" + playerId, callback, "DELETE", null, token);
}


// Export extensions
window.updateLastMatchUI = updateLastMatchUI;
window.loadTeamStats = loadTeamStats;
window.renderPlayerCard = renderPlayerCard;
window.renderMatchCard = renderMatchCard;
window.loadLeaderboardUI = loadLeaderboardUI;
window.executeSellPlayer = executeSellPlayer;