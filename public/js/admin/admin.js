document.addEventListener("DOMContentLoaded", function () {
    if (!adminCheck()) {
        return;
    }

    // ========== CALLBACKS ==========

    const callbackForUserCount = (status, data) => {
        const countSpan = document.getElementById("count-users");
        if (countSpan) {
            if (status === 200 && Array.isArray(data)) {
                countSpan.innerText = data.length;
            } else {
                countSpan.innerText = "?";
            }
        }
    };

    const callbackForBadgeCount = (status, data) => {
        const countSpan = document.getElementById("count-badges");
        if (countSpan) {
            if (status === 200 && Array.isArray(data)) {
                countSpan.innerText = data.length;
            } else {
                countSpan.innerText = "?";
            }
        }
    };

    const callbackForPlayerCount = (status, data) => {
        const countSpan = document.getElementById("count-players");
        if (countSpan) {
            if (status === 200 && Array.isArray(data)) {
                countSpan.innerText = data.length;
            } else {
                countSpan.innerText = "?";
            }
        }
    };

    const callbackForChallengeCount = (status, data) => {
        const countSpan = document.getElementById("count-challenges");
        if (countSpan) {
            if (status === 200 && Array.isArray(data)) {
                countSpan.innerText = data.length;
            } else {
                countSpan.innerText = "?";
            }
        }
    };

    const callbackForTeamCount = (status, data) => {
        const countSpan = document.getElementById("count-teams");
        if (countSpan) {
            if (status === 200 && Array.isArray(data)) {
                countSpan.innerText = data.length;
            } else {
                countSpan.innerText = "?";
            }
        }
    };

    // ========== INITIAL LOAD ==========
    
    // Fetch counts for dashboard
    fetchMethod(currentUrl + "/api/users", callbackForUserCount, "GET");
    fetchMethod(currentUrl + "/api/badges", callbackForBadgeCount, "GET");
    fetchMethod(currentUrl + "/api/catalogue", callbackForPlayerCount, "GET");
    fetchMethod(currentUrl + "/api/challenges", callbackForChallengeCount, "GET");
    fetchMethod(currentUrl + "/api/teams", callbackForTeamCount, "GET");
});
