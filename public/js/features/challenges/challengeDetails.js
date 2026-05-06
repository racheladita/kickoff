document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const urlParams = new URLSearchParams(window.location.search);
    const challengeId = urlParams.get("id");

    if (!challengeId) {
        showMessage("No challenge ID provided!", "challenges.html");
        return;
    }

    if (!token) {
        showMessage("Please login to view challenge details!", "login.html");
        return;
    }

    let hasCompleted = false;

    // ========== FUNCTIONS ==========

    function executeDeleteChallenge() {
        const callback = (status, result) => {
            if (status === 204) {
                showMessage("Challenge deleted!", "challenges.html");
            } else {
                showMessage(result.message || "Failed to delete challenge.");
            }
        };

        fetchMethod(currentUrl + "/api/challenges/" + challengeId, callback, "DELETE", null, token);
    }

    function fetchChallengeDetails() {
        const callback = (status, challenge) => {
            if (status === 200 && challenge) {
                document.getElementById("loading-state").classList.add("d-none");
                document.getElementById("challenge-details").classList.remove("d-none");
                
                document.getElementById("challenge-title").textContent = challenge.title || "Untitled Challenge";
                document.getElementById("challenge-description").textContent = challenge.description;
                document.getElementById("challenge-points").textContent = challenge.points;
                
                let creatorName = "Unknown";
                if (challenge.creator_name) {
                    creatorName = challenge.creator_name;
                }
                document.getElementById("creator-name").textContent = creatorName;

                renderActionButtons(challenge);
                
                // Trigger auxiliary fetch via dedicated function
                fetchCompletions();
            } else {
                const message = `
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h3 class="text-white">Challenge Not Found</h3>
                        <p class="text-white opacity-75">This challenge might have been removed or the URL is incorrect.</p>
                    </div>
                `;
                showMessage(message, "challenges.html");
            }
        };

        fetchMethod(currentUrl + "/api/challenges/" + challengeId + "/details", callback, "GET", null, token);
    }

    function fetchCompletions() {
        const callback = (status, data) => {
            const list = document.getElementById("completions-list");
            if (!list) {
                return;
            }
            
            if (status === 200 && data.completions && data.completions.length > 0) {
                hasCompleted = data.completions.some(completion => 
                    Number(completion.user_id) === Number(userId) && isToday(completion.completed_at)
                );
                
                if (hasCompleted) {
                    const completeBtn = document.getElementById("complete-btn");
                    if (completeBtn) {
                        completeBtn.remove();
                    }
                }

                list.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Completed At</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.completions.map(completion => {
                                    let displayName = "User #" + completion.user_id;
                                    if (completion.username) {
                                        displayName = completion.username;
                                    }

                                    let details = "-";
                                    if (completion.details) {
                                        details = completion.details;
                                    }

                                    return `
                                        <tr>
                                            <td>${displayName}</td>
                                            <td>${formatDate(completion.completed_at)}</td>
                                            <td>${details}</td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                list.innerHTML = '<p class="text-muted text-center pt-2">No completions yet. Be the first!</p>';
            }
        };

        fetchMethod(currentUrl + "/api/challenges/" + challengeId, callback, "GET", null, token);
    }

    function renderActionButtons(challenge) {
        const isOwner = Number(challenge.creator_id) === Number(userId);
        const isAdmin = Number(userId) === 1;
        const canEdit = isOwner || isAdmin;

        let buttonsHtml = "";

        if (token) {
            buttonsHtml += `
                <button id="complete-btn" class="btn btn-pink w-100 justify-content-center mb-3" onclick="confirmComplete()">
                    <i class="fas fa-check"></i> Complete
                </button>
            `;
        }
     
        if (canEdit) {
            buttonsHtml += `
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-light flex-grow-1" onclick="showEditForm()">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-delete-red flex-grow-1" onclick="confirmDelete()">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
        }
     
        const container = document.getElementById("action-buttons");
        if (container) {
            container.innerHTML = buttonsHtml;
        }
    }

    // ========== WINDOW GLOBALS (UI CALLABLE) ==========

    window.showEditForm = function() {
        if (!challengeId) {
            return;
        }
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `editChallenge.html?id=${challengeId}&returnUrl=${returnUrl}`;
    };

    window.confirmComplete = function() {
        quickCompleteChallenge(challengeId, function() {
            // Reload details via dedicated function
            fetchChallengeDetails();
        });
    };

    window.confirmDelete = function() {
        showConfirm("Are you sure you want to delete this challenge? This cannot be undone!", function() {
            executeDeleteChallenge();
        });
    };

    // ========== INITIAL LOAD ==========
    fetchChallengeDetails();
});
