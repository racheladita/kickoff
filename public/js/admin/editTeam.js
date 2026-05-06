document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get("id");

    if (!adminCheck()) {
        return;
    }

    if (!teamId) {
        showMessage("Invalid team ID.", "adminTeams.html");
        return;
    }

    // ========== CALLBACKS ==========

    // Callback for loading team data to prepopulate form
    const callbackForTeamLoad = (status, team) => {
        if (status === 200) {
            const idField = document.getElementById("team-id");
            const ownerField = document.getElementById("team-owner");
            const nameField = document.getElementById("team-name");

            if (idField) {
                idField.value = team.team_id;
            }
            if (ownerField) {
                let ownerName = 'User #' + team.user_id;
                if (team.username) {
                    ownerName = team.username;
                }
                ownerField.value = ownerName;
            }
            if (nameField) {
                let teamName = '';
                if (team.team_name) {
                    teamName = team.team_name;
                }
                nameField.value = teamName;
            }
        } else {
            handleAdminError(status, team, "Team not found.", "adminTeams.html", "error-message");
        }
    };

    // Callback for updating team
    const callbackForUpdate = (status, result) => {
        if (status === 200) {
            showMessage("Team updated successfully!", "adminTeams.html");
        } else {
            handleAdminError(status, result, "Failed to update team.", null, "error-message");
        }
    };

    // ========== FORM HANDLER ==========

    const teamForm = document.getElementById("team-form");
    if (teamForm) {
        teamForm.onsubmit = function(event) {
            event.preventDefault();
            
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }

            const teamName = document.getElementById("team-name").value.trim();

            if (!teamName) {
                setFieldError("team-name", "Team name is required.", "error-name");
                return;
            }

            const updateData = {
                name: teamName
            };

            fetchMethod(currentUrl + "/api/teams/" + teamId, callbackForUpdate, "PUT", updateData, token);
        };
    }

    // ========== INITIAL LOAD ==========
    fetchMethod(currentUrl + "/api/teams/" + teamId, callbackForTeamLoad, "GET", null, token);
});
