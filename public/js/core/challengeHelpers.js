// 1. Render a Standard Challenge Card
function renderChallengeCard(challenge, options = {}) {
    let isCompleted = false;
    if (options.isCompleted) {
        isCompleted = true;
    }

    let hideActions = false;
    if (options.hideActions) {
        hideActions = true;
    }
    const token = localStorage.getItem("token");

    let buttonHtml = '';
    if (!hideActions && token) {
        if (isCompleted) {
            buttonHtml = `
                <button class="btn btn-disabled flex-fill disabled" disabled>
                    <i class="fas fa-check-circle"></i> Completed
                </button>
            `;
        } else {
            buttonHtml = `
                <button onclick="quickCompleteChallenge(${challenge.challenge_id})" class="btn btn-pink flex-fill">
                    <i class="fas fa-check"></i> Complete
                </button>
            `;
        }
    }

    let detailsBtn = '';
    if (!hideActions && token) {
        detailsBtn = `
            <a href="challengeDetails.html?id=${challenge.challenge_id}" class="btn btn-outline-light flex-fill">
                <i class="fas fa-eye"></i> View Details
            </a>
        `;
    }

    let title = "Untitled Challenge";
    if (challenge.title) {
        title = challenge.title;
    }

    return `
        <div class="card-section h-100 p-4">
            <h3 class="text-pink">${title}</h3>
            <p class="text-muted">${challenge.description}</p>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-white fw-bold"><i class="fas fa-coins text-warning me-1"></i> ${challenge.points} Pts</span>
            </div>
            <div class="d-flex gap-2 mt-auto">
                ${detailsBtn}
                ${buttonHtml}
            </div>
        </div>
    `;
}

// 2. Shared Challenge Completion Logic
function executeCompleteChallenge(id, notes, onSuccess, token) {
    const callback = (status, result) => {
        if (status === 200 || status === 201) {
            let message = "Challenge completed!";
            if (result.message) {
                message = result.message;
            }

            if (result.points_gained) {
                message += ` You earned <i class="fas fa-coins text-warning"></i> ${result.points_gained} points!`;
            }
            
            // Refresh points in navbar if the function exists
            if (typeof window.updateNavPoints === "function") {
                window.updateNavPoints();
            }
            
            setTimeout(() => {
                showBadgeEarned(result.badges, message, window.location.href);
                if (onSuccess) {
                    onSuccess(result);
                }
            }, 400);
        } else {
            setTimeout(() => {
                handleApiError(status, result, "Error completing challenge");
            }, 400);
        }
    };

    fetchMethod(currentUrl + "/api/challenges/" + id, callback, "POST", { details: notes }, token);
}

// 3. Quick Complete Challenge
function quickCompleteChallenge(id, onSuccess) {
    const token = localStorage.getItem("token");
    if (!token) {
        showMessage("Please login to complete challenges!", "login.html");
        return;
    }

    showPrompt("Are you sure you want to complete this challenge?<br><br> Any notes on your progress? (Optional)", function(notes) {
        executeCompleteChallenge(id, notes, onSuccess, token);
    });
}

// Export to window
window.renderChallengeCard = renderChallengeCard;
window.quickCompleteChallenge = quickCompleteChallenge;