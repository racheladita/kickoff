document.addEventListener("DOMContentLoaded", function () {
    const challengeList = document.getElementById("challenge-admin-list");
    const token = localStorage.getItem("token");

    if (!adminCheck()) {
        return;
    }

    // ========== STATE ==========
    let allChallenges = [];
    let challengesCurrentPage = 1;
    const challengesLimit = 10;

    // ========== CALLBACKS ==========

    // Callback for loading challenges
    const callbackForChallenges = (status, challenges) => {
        if (!challengeList) {
            return;
        }

        if (status === 200) {
            allChallenges = challenges || [];
            renderChallenges();
        } else {
            handleTableError("challenge-admin-list", 6, "Error loading challenges.", "retryLoadChallenges", status);
        }
    };

    // ========== FUNCTIONS ==========

    function renderChallenges() {
        if (allChallenges.length === 0) {
            challengeList.innerHTML = '<tr><td colspan="6" class="text-center text-white py-5 opacity-75">No platform challenges available.</td></tr>';
            renderPager("challenge-pager", 0, 1, challengesLimit, "changeChallengesPage");
            return;
        }

        // Apply Pagination
        const pagedChallenges = paginateArray(allChallenges, challengesCurrentPage, challengesLimit);
        
        // Calculate the starting number for NO. column
        let entryNo = (challengesCurrentPage - 1) * challengesLimit + 1;

        challengeList.innerHTML = pagedChallenges.map(challenge => {
            let description = challenge.description || "";
            if (description.length > 50) {
                description = description.substring(0, 50) + "...";
            }

            let creatorName = challenge.creator_name || "Admin";

            return `
                <tr>
                    <td class="px-3 fw-bold">${entryNo++}</td>
                    <td class="fw-bold text-white">${challenge.title}</td>
                    <td class="small text-white text-opacity-75 d-none d-lg-table-cell">${description}</td>
                    <td class="fw-bold"><span class="badge text-pink">${challenge.points} PTS</span></td>
                    <td class="small text-white text-opacity-50 d-none d-lg-table-cell">${creatorName}</td>
                    <td class="text-end pe-3">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="editChallenge.html?id=${challenge.challenge_id}" class="btn btn-sm btn-outline-light" title="Edit">
                                <i class="fas fa-edit"></i><span class="d-none d-md-block">Edit</span>
                            </a>
                            <button onclick="deleteChallenge(${challenge.challenge_id})" class="btn btn-sm btn-delete-red" title="Delete">
                                <i class="fas fa-trash-alt"></i><span class="d-none d-md-block">Delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        renderPager("challenge-pager", allChallenges.length, challengesCurrentPage, challengesLimit, "changeChallengesPage");
    }

    window.changeChallengesPage = function(newPage) {
        challengesCurrentPage = newPage;
        renderChallenges();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.retryLoadChallenges = function () {
        handleTableLoading("challenge-admin-list", 6, "Loading challenges...");
        fetchMethod(currentUrl + "/api/challenges", callbackForChallenges, "GET", null, token);
    };

    window.deleteChallenge = function (id) {
        executeAdminDelete(currentUrl + "/api/challenges/" + id, "Challenge deleted.", retryLoadChallenges, "Remove this challenge from the system?");
    };

    // ========== INITIAL LOAD ==========
    retryLoadChallenges();
});
