document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!checkSession()) {
        return;
    }

    if (typeof checkAuth === "function") {
        checkAuth();
    }

    // ========== FUNCTIONS ==========
    
    function fetchBadges() {
        const callback = (status, badges) => {
            const container = document.getElementById("badges-container");
            if (status === 200 && badges.length > 0) {
                container.innerHTML = badges.map(badge => {
                    let badgeImg = '../../images/trophy.png';
                    if (badge.image) {
                        badgeImg = badge.image;
                    }
                    return `
                    <div class="card glass p-2 text-center w-25">
                        <img src="${badgeImg}" alt="${badge.name}" class="img-fluid mb-1 mx-auto">
                        <small class="d-block fw-bold text-white">${badge.name}</small>
                    </div>
                `;
                }).join('');
            } else {
                container.innerHTML = '<p class="text-white text-opacity-75 mb-4">No badges earned yet. Complete <a class="link-light fw-bold text-decoration-none" href="challenges.html">challenges</a> to earn them!</p>';
            }
        };
        fetchMethod(currentUrl + `/api/user-badges/user/${userId}`, callback, "GET", null, token);
    }

    function fetchCompletions() {
        const callback = (status, completions) => {
            const container = document.getElementById("completions-container");
            if (status === 200 && completions.length > 0) {
                container.innerHTML = completions.slice(0, 5).map(completion => `
                    <div class="completion-item d-flex justify-content-between align-items-center mb-2 p-2 glass rounded">
                        <div>
                            <span class="fw-bold">${completion.title || "Untitled"}</span>
                            <small class="text-muted d-block">${formatDate(completion.completed_at)}</small>
                        </div>
                        <span class="badge bg-success">+${completion.points} PTS</span>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-white text-opacity-75 mb-4">No completions found.</p>';
            }
        };
        fetchMethod(currentUrl + `/api/completions/user/${userId}`, callback, "GET", null, token);
    }

    function fetchTeamSummary() {
        const callback = (status, team) => {
            const loading = document.getElementById("team-loading");
            const emptyState = document.getElementById("team-empty-state");
            const displayState = document.getElementById("team-display-state");
            const createForm = document.getElementById("team-create-form");

            if (loading) {
                loading.classList.add("d-none");
            }
            if (status === 200 && team && team.team_id) {
                if (displayState) {
                    displayState.classList.remove("d-none");
                }
                if (emptyState) {
                    emptyState.classList.add("d-none");
                }
                if (createForm) {
                    createForm.classList.add("d-none");
                }
                
                const teamNameEl = document.getElementById("display-team-name");
                if (teamNameEl) {
                    teamNameEl.innerText = team.team_name;
                }
                
                loadTeamStats(team.team_id, "summary-player-count", "summary-avg-rating");
                updateLastMatchUI(team.team_id, "summary-last-match", "summary-match-date");
            } else {
                if (emptyState) {
                    emptyState.classList.remove("d-none");
                }
                if (displayState) {
                    displayState.classList.add("d-none");
                }
            }
        };
        fetchMethod(currentUrl + `/api/teams/user/${userId}`, callback, "GET", null, token);
    }

    function executeProfileUpdate(formData) {
        const callback = (status, result) => {
            const currentUsername = document.getElementById("edit-username").value.trim();
            const currentPassword = document.getElementById("edit-password").value;

            if (status === 200) {
                localStorage.setItem("username", currentUsername);
                if (currentPassword) {
                    showMessage("Profile updated! Please log in again with your new password.", "login.html");
                    handleLogout(false);
                } else {
                    showMessage("Profile updated successfully!");
                    
                    const okBtn = document.getElementById('message-ok-btn');
                    if (okBtn) {
                        okBtn.onclick = () => {
                            if (typeof globalMessageModal !== 'undefined' && globalMessageModal) {
                                globalMessageModal.hide();
                            }
                            window.location.reload();
                        };
                    }
                }
            } else if (status === 409) {
                if (result.conflict === 'username') {
                    setFieldError("edit-username", "Username is already taken.", "error-username");
                    showMessage("Conflict: Username is already taken.");
                } else if (result.conflict === 'email') {
                    setFieldError("edit-email", "Email is already registered.", "error-email");
                    showMessage("Conflict: Email is already registered.");
                } else if (result.conflict === 'both') {
                    setFieldError("edit-username", "Username is already taken.", "error-username");
                    setFieldError("edit-email", "Email is already registered.", "error-email");
                    showMessage("Conflict: Username and email already registered.");
                } else {
                    // Fallback for generic 409
                    setFieldError("edit-username", "Username or email already exists.", "error-username");
                    showMessage("Conflict: Username or email already exists.");
                }
            } else {
                showMessage("Error updating profile: " + (result.message || "Unknown error"));
            }
        };
        fetchMethod(currentUrl + `/api/users/${userId}`, callback, "PUT", formData, token);
    }

    function executeCreateTeam(data) {
        const callback = (status, result) => {
            if (status === 201) {
                showMessage("Team established successfully!");
                document.getElementById("team-create-form").classList.add("d-none");
                // Reload team summary
                fetchTeamSummary();
            } else if (status === 409) {
                setFieldError("merge-team-name", "This team name is already taken.", "error-name");
                showMessage("Conflict: Team name already exists. Please choose another team name.");
            } else {
                let errorMsgText = "Unknown error";
                if (result.message) {
                    errorMsgText = result.message;
                }
                showMessage("Error establishing team: " + errorMsgText);
            }
        };
        fetchMethod(currentUrl + "/api/teams", callback, "POST", data, token);
    }

    // ========== UI TOGGLE FUNCTIONS ==========
    // Use window to make functions global so they can be called from HTML onclick events
    
    // Toggle edit profile form
    window.toggleEditForm = function() {
        const editSection = document.getElementById("edit-profile-section");
        const showBtn = document.getElementById("show-edit-btn");
        
        if (editSection.classList.contains("d-none")) {
            editSection.classList.remove("d-none");
            showBtn.innerHTML = `<i class="fas fa-times me-2"></i> Cancel Editing`;
            showBtn.classList.replace("btn-outline-light", "btn-outline-danger");
            
            setTimeout(() => {
                editSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            editSection.classList.add("d-none");
            showBtn.innerHTML = `<i class="fas fa-user-edit me-2"></i> Edit Profile`;
            showBtn.classList.replace("btn-outline-danger", "btn-outline-light");
        }
    };

    // Show team form
    window.showTeamForm = function() {
        document.getElementById("team-empty-state").classList.add("d-none");
        document.getElementById("team-create-form").classList.remove("d-none");
    };

    // ========== FORM HANDLERS ==========

    // Profile Update Form
    const editForm = document.getElementById("edit-profile-form");
    if (editForm) {
        editForm.onsubmit = function(event) {
            event.preventDefault();
            clearFieldErrors();

            const username = document.getElementById("edit-username").value.trim();
            const email = document.getElementById("edit-email").value.trim();
            const password = document.getElementById("edit-password").value;
            const confirmPassword = document.getElementById("edit-confirm-password").value;

            let hasError = false;

            if (!username) {
                setFieldError("edit-username", "Username is required.", "error-username");
                hasError = true;
            } else if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
                setFieldError("edit-username", "Username must be 3-20 alphanumeric characters.", "error-username");
                hasError = true;
            }

            if (!email) {
                setFieldError("edit-email", "Email address is required.", "error-email");
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFieldError("edit-email", "Please enter a valid email address.", "error-email");
                hasError = true;
            }

            if (password) {
                if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
                    setFieldError("edit-password", "Password must be at least 6 characters with uppercase, number, and special character.", "error-password");
                    hasError = true;
                }
                if (password !== confirmPassword) {
                    setFieldError("edit-confirm-password", "Passwords do not match.", "error-confirm-password");
                    hasError = true;
                }
            }

            if (hasError) {
                // Scroll to the first error
                const firstError = document.querySelector(".error-message:not(.d-none)");
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            if (password) {
                formData.append('password', password);
            }
            
            const fileInput = document.getElementById("edit-profile-pic");
            if (fileInput && fileInput.files.length > 0) {
                formData.append('profile_pic', fileInput.files[0]);
            }

            showConfirm("Save these changes to your profile?", function() {
                clearFieldErrors();
                executeProfileUpdate(formData);
            });
        };
    }

    // Team Creation Form
    const teamForm = document.getElementById("merge-team-form");
    if (teamForm) {
        teamForm.onsubmit = function(event) {
            event.preventDefault();
            clearFieldErrors();

            const teamNameEl = document.getElementById("merge-team-name");
            let teamName = "";
            if (teamNameEl) {
                teamName = teamNameEl.value.trim();
            }
            
            if (!teamName) {
                setFieldError("merge-team-name", "Team name is required.", "error-name");
                return;
            }

            if (teamName.length < 3 || teamName.length > 25) {
                setFieldError("merge-team-name", "Team name must be 3-25 characters.", "error-name");
                return;
            }

            const data = { name: teamName };
            executeCreateTeam(data);
        };
    }

    // ========== INITIAL LOAD ==========
    const callbackForProfile = (status, data) => {
        if (status === 200) {
            document.getElementById("username-display").innerText = data.username;
            document.getElementById("email-display").innerText = data.email;
            document.getElementById("points-display").innerText = formatPoints(data.points);
            document.getElementById("streak-display").innerText = data.streak_days;

            let profilePic = "../../images/user.png";
            if (data.profile_pic) {
                profilePic = data.profile_pic;
            }

            const avatarCircle = document.querySelector(".icon-circle");
            avatarCircle.innerHTML = `<img src="${profilePic}" alt="Profile" class="w-100 h-100 rounded-circle object-fit-cover">`;

            // Pre-fill edit form
            if (document.getElementById("edit-username")) {
                document.getElementById("edit-username").value = data.username;
                document.getElementById("edit-email").value = data.email;
            }

            // Trigger auxiliary fetches via dedicated functions
            fetchBadges();
            fetchCompletions();
            fetchTeamSummary();
        } else {
            handleApiError(status, data, "Error loading profile");
        }
    };
    fetchMethod(currentUrl + `/api/users/${userId}`, callbackForProfile, "GET", null, token);
});
