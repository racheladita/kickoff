document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("error-message");
    const urlParams = new URLSearchParams(window.location.search);
    const challengeId = urlParams.get("id");
    const returnUrl = urlParams.get("returnUrl");
    const userId = localStorage.getItem("user_id");

    if (!checkAuth()) {
        return;
    }

    // Handle Return URL and Navigation
    handleFormReturnUrl("back-link", "cancel-link");

    if (!returnUrl) {
        // Set default based on role
        let target = "challenges.html";
        if (userId == 1) {
            target = "adminChallenges.html";
        }
        const backLink = document.getElementById("back-link");
        const cancelLink = document.getElementById("cancel-link");
        if (backLink) {
            backLink.href = target;
        }
        if (cancelLink) {
            cancelLink.href = target;
        }
    }

    // ========== CALLBACKS ==========

    // Callback for loading challenge data to prepopulate form
    const callbackForChallengeLoad = (status, challenge) => {
        if (status === 200) {
            const idField = document.getElementById("challenge-id");
            const titleField = document.getElementById("challenge-title");
            const descriptionField = document.getElementById("challenge-description");
            const pointsField = document.getElementById("challenge-points");

            if (idField) {
                idField.value = challenge.challenge_id;
            }
            if (titleField) {
                titleField.value = challenge.title;
            }
            if (descriptionField) {
                descriptionField.value = challenge.description;
            }
            if (pointsField) {
                pointsField.value = challenge.points;
            }
        } else {
            handleAdminError(status, challenge, "Challenge not found.", "adminChallenges.html", "error-message");
        }
    };

    // Callback for updating challenge
    const callbackForUpdate = (status, result) => {
        if (status === 200) {
            showMessage("Challenge updated successfully!", returnUrl || "adminChallenges.html");
        } else {
            handleAdminError(status, result, "Failed to update challenge.", null, "error-message");
        }
    };

    // ========== FORM HANDLER ==========

    const challengeForm = document.getElementById("challenge-form");
    if (challengeForm) {
        challengeForm.onsubmit = function(event) {
            event.preventDefault();
            
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }

            const title = document.getElementById("challenge-title").value.trim();
            const description = document.getElementById("challenge-description").value.trim();
            const pointsVal = document.getElementById("challenge-points").value;
            const points = parseInt(pointsVal);

            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!title) {
                setFieldError("challenge-title", "Title is required.", "error-title");
                hasError = true;
            }
            if (!description) {
                setFieldError("challenge-description", "Description is required.", "error-description");
                hasError = true;
            }
            if (isNaN(points) || points < 10 || points > 500) {
                setFieldError("challenge-points", "Points must be at least 10 and less than 500.", "error-points");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const updateData = {
                title: title,
                description: description,
                points: points
            };

            fetchMethod(currentUrl + "/api/challenges/" + challengeId, callbackForUpdate, "PUT", updateData, token);
        };
    }

    // ========== INITIAL LOAD ==========
    fetchMethod(currentUrl + "/api/challenges/" + challengeId + "/details", callbackForChallengeLoad, "GET", null, token);
});
