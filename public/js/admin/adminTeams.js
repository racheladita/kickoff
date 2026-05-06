document.addEventListener("DOMContentLoaded", function () {
    const teamList = document.getElementById("team-admin-list");
    const token = localStorage.getItem("token");

    if (!adminCheck()) {
        return;
    }

    // ========== CALLBACKS ==========

    // Callback for loading teams
    const callbackForTeams = (status, teams) => {
        if (!teamList) {
            return;
        }

        if (status === 200) {
            if (!teams || teams.length === 0) {
                teamList.innerHTML = '<tr><td colspan="5" class="text-center text-white py-5 opacity-75">No teams found in the database.</td></tr>';
                return;
            }

            let i = 1;
            teamList.innerHTML = teams.map(team => {
                let playerCount = 0;
                if (team.player_count) {
                    playerCount = team.player_count;
                }

                return `
                    <tr>
                        <td class="px-3 fw-bold">${i++}</td>
                        <td class="fw-bold text-white">${team.team_name}</td>
                        <td class="small text-white text-opacity-75 d-none d-lg-table-cell">${team.username}</td>
                        <td><span class="badge text-pink">${playerCount} players</span></td>
                        <td class="text-end pe-3">
                            <div class="d-flex justify-content-end gap-2">
                                <a href="editTeam.html?id=${team.team_id}" class="btn btn-sm btn-outline-light" title="Edit">
                                    <i class="fas fa-edit"></i><span class="d-none d-md-block">Edit</span>
                                </a>
                                <button onclick="deleteTeam(${team.team_id})" class="btn btn-sm btn-delete-red" title="Delete">
                                    <i class="fas fa-trash-alt"></i><span class="d-none d-md-block">Delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            handleTableError("team-admin-list", 5, "Error loading teams.", "retryLoadTeams", status);
        }
    };

    // ========== FUNCTIONS ==========

    window.retryLoadTeams = function () {
        handleTableLoading("team-admin-list", 5, "Loading teams...");
        fetchMethod(currentUrl + "/api/teams", callbackForTeams, "GET", null, token);
    };

    window.deleteTeam = function (id) {
        executeAdminDelete(currentUrl + "/api/teams/" + id, "Team deleted.", retryLoadTeams, "Remove this team from the system?");
    };

    // ========== INITIAL LOAD ==========
    retryLoadTeams();
});
