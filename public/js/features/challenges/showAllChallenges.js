document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    // ========== STATE ==========
    let allChallenges = [];
    let allCompletedIds = [];
    let challengesCurrentPage = 1;
    const challengesLimit = 6;

    // ========== CALLBACKS ==========
    // Callback for initial challenges load
    const callbackForChallenges = (status, challenges) => {
        if (status === 200) {
            allChallenges = challenges;
            handleCompletionsFetch();
        } else {
            allChallenges = [];
            renderChallenges();
        }
    };

    // ========== FUNCTIONS ==========

    function handleCompletionsFetch() {
        // Only fetch completions if the user is logged in
        if (userId && token) {
            const callback = (status, completions) => {
                if (status === 200) {
                    allCompletedIds = completions
                        .filter(completion => isToday(completion.completed_at))
                        .map(completion => completion.challenge_id);
                } else {
                    allCompletedIds = [];
                }
                renderChallenges();
            };
            fetchMethod(currentUrl + "/api/completions/user/" + userId, callback, "GET", null, token);
        } else {
            // Guest mode: no completions
            allCompletedIds = [];
            renderChallenges();
        }
    }

    function renderChallenges() {
        const grid = document.getElementById("challenges-grid");
        if (allChallenges.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-white opacity-75">No challenges available at the moment. Check back later!</p></div>';
            return;
        }

        // Apply Pagination
        const pagedChallenges = paginateArray(allChallenges, challengesCurrentPage, challengesLimit);

        grid.innerHTML = pagedChallenges
            .map(challenge => {
                const isCompleted = allCompletedIds.includes(challenge.challenge_id);
                const data = { 
                    isCompleted: isCompleted,
                    formattedPoints: formatPoints(challenge.points)
                };
                return `
                    <div class="col">
                        ${renderChallengeCard(challenge, data)}
                    </div>`;
            })
            .join("");

        renderPager("challenges-pager", allChallenges.length, challengesCurrentPage, challengesLimit, "changeChallengesPage");
    }

    // Global function for pager to call
    window.changeChallengesPage = function(newPage) {
        challengesCurrentPage = newPage;
        renderChallenges();
        // Scroll to top of grid
        document.getElementById("challenges-grid").scrollIntoView({ behavior: 'smooth' });
    };

    // Quick complete from list (with confirmation)
    window.quickComplete = function (id) {
        quickCompleteChallenge(id, function() {
            // Reload challenges
            fetchMethod(currentUrl + "/api/challenges", callbackForChallenges, "GET", null, token);
        });
    };

    // Display create button only for logged-in users
    if (token) {
        const createContainer = document.getElementById("create-challenge-container");
        if (createContainer) {
            createContainer.classList.remove("d-none");
        }
    }

    // Initial fetch to load challenges
    fetchMethod(currentUrl + "/api/challenges", callbackForChallenges, "GET", null, token);
});
