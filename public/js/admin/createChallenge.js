document.addEventListener("DOMContentLoaded", function () {
    const createForm = document.getElementById("create-challenge-form");
    const errorMsg = document.getElementById("error-message");
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl");
    const userId = localStorage.getItem("user_id");

    if (!checkAuth()) {
        return;
    }

    // Handle Return URL and Navigation
    handleFormReturnUrl("back-link", "cancel-btn");

    if (!returnUrl) {
        // Set default based on role
        const cancelBtn = document.getElementById("cancel-btn");
        const backLink = document.getElementById("back-link");
        let target = "challenges.html";
        if (userId == 1) {
            target = "adminChallenges.html";
        }
        if (cancelBtn) {
            cancelBtn.href = target;
        }
        if (backLink) {
            backLink.href = target;
        }
    }

    // ========== CALLBACKS ==========

    // Callback for creating a challenge
    const callbackForCreate = (status, result) => {
        if (status === 201) {
            let defaultTarget = "challenges.html";
            if (userId == 1) {
                defaultTarget = "adminChallenges.html";
            }
            
            let targetPage = defaultTarget;
            if (returnUrl) {
                targetPage = returnUrl;
            }
            showMessage("Challenge created successfully!", targetPage);
        } else {
            handleAdminError(status, result, "Failed to create challenge.", null, "error-message");
        }
    };

    // ========== FORM HANDLER ==========

    if (createForm) {
        createForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const titleInput = document.getElementById("challenge-title");
            const descriptionInput = document.getElementById("challenge-description");
            const pointsInput = document.getElementById("challenge-points");

            // Reset errors
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }
            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!titleInput.value.trim()) {
                setFieldError("challenge-title", "Title is required", "error-title");
                hasError = true;
            }

            if (!descriptionInput.value.trim()) {
                setFieldError("challenge-description", "Description is required", "error-description");
                hasError = true;
            }

            const pointsVal = parseInt(pointsInput.value);
            if (isNaN(pointsVal) || pointsVal < 10 || pointsVal > 500) {
                setFieldError("challenge-points", "Points must be at least 10 and less than 500", "error-points");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const challengeData = {
                title: titleInput.value.trim(),
                description: descriptionInput.value.trim(),
                points: pointsVal
            };

            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }
            fetchMethod(currentUrl + "/api/challenges", callbackForCreate, "POST", challengeData, token);
        });
    }
});
