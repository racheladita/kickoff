document.addEventListener("DOMContentLoaded", function () {
    const playerList = document.getElementById("player-admin-list");
    const token = localStorage.getItem("token");

    if (!adminCheck()) {
        return;
    }

    // ========== STATE ==========
    let allPlayers = [];
    let playersCurrentPage = 1;
    const playersLimit = 10;

    // ========== CALLBACKS ==========

    // Callback for loading players
    const callbackForPlayers = (status, players) => {
        if (!playerList) {
            return;
        }

        if (status === 200) {
            allPlayers = players || [];
            renderPlayers();
        } else {
            handleTableError("player-admin-list", 7, "Error loading players.", "retryLoadPlayers", status);
        }
    };

    // ========== FUNCTIONS ==========

    function renderPlayers() {
        if (allPlayers.length === 0) {
            playerList.innerHTML = '<tr><td colspan="7" class="text-center text-white py-5 opacity-75">Your catalogue is currently empty.</td></tr>';
            renderPager("player-pager", 0, 1, playersLimit, "changePlayerPage");
            return;
        }

        // Apply Pagination
        const pagedPlayers = paginateArray(allPlayers, playersCurrentPage, playersLimit);
        
        // Calculate the starting number for NO. column
        let entryNo = (playersCurrentPage - 1) * playersLimit + 1;

        playerList.innerHTML = pagedPlayers.map(player => {
            let imageSrc = player.image || "../../images/cristiano.png";
            let cost = formatPoints(player.unlock_cost);

            return `
                <tr>
                    <td class="px-3 fw-bold">${entryNo++}</td>
                    <td><img src="${imageSrc}" class="catalogue-img-sm rounded shadow-sm"></td>
                    <td class="fw-bold text-white">${player.name}</td>
                    <td class="d-none d-lg-table-cell"><span class="badge bg-secondary opacity-75">${player.position}</span></td>
                    <td class="d-none d-lg-table-cell"><span><i class="fas fa-star text-warning"></i> ${player.rating}</span></td>
                    <td class="fw-bold"><i class="fas fa-coins text-warning"></i> ${cost}</td>
                    <td class="text-end pe-3">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="editPlayer.html?id=${player.catalogue_id}&returnUrl=${encodeURIComponent(window.location.href)}" class="btn btn-sm btn-outline-light" title="Edit">
                                <i class="fas fa-edit"></i><span class="d-none d-md-block">Edit</span>
                            </a>
                            <button onclick="deletePlayer(${player.catalogue_id})" class="btn btn-sm btn-delete-red" title="Delete">
                                <i class="fas fa-trash-alt"></i><span class="d-none d-md-block">Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        renderPager("player-pager", allPlayers.length, playersCurrentPage, playersLimit, "changePlayerPage");
    }

    window.changePlayerPage = function(newPage) {
        playersCurrentPage = newPage;
        renderPlayers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.retryLoadPlayers = function() {
        handleTableLoading("player-admin-list", 7, "Loading players...");
        fetchMethod(currentUrl + "/api/catalogue", callbackForPlayers, "GET", null, token);
    };

    window.deletePlayer = function(id) {
        executeAdminDelete(currentUrl + "/api/catalogue/" + id, "Player removed.", retryLoadPlayers, "Remove this player from the catalogue?");
    };

    // ========== INITIAL LOAD ==========
    retryLoadPlayers();
});
