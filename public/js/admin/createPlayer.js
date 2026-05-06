document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("error-message");
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl");

    if (!adminCheck()) {
        return;
    }

    // Handle Return URL and Navigation
    handleFormReturnUrl("back-link", "cancel-link");

    // ========== CALLBACKS ==========

    // Callback for creating a player
    const callbackForCreate = (status, result) => {
        if (status === 201) {
            showMessage("Player added successfully!", returnUrl || "adminPlayers.html");
        } else {
            handleAdminError(status, result, "Failed to add player.", null, "error-message");
        }
    };

    // ========== FORM HANDLER ==========

    const playerForm = document.getElementById("player-form");
    if (playerForm) {
        playerForm.onsubmit = function(event) {
            event.preventDefault();
            
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }

            const name = document.getElementById("player-name").value.trim();
            const position = document.getElementById("player-position").value;
            const description = document.getElementById("player-description").value;
            const ratingVal = document.getElementById("player-rating").value;
            const costVal = document.getElementById("player-cost").value;
            const rating = parseInt(ratingVal);
            const cost = parseInt(costVal);
            const imageFile = document.getElementById("player-image").files[0];

            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!name) {
                setFieldError("player-name", "Player name is required.");
                hasError = true;
            }
            if (!position) {
                setFieldError("player-position", "Player position is required.");
                hasError = true;
            }
            if (!description) {
                setFieldError("player-description", "Player description is required.");
                hasError = true;
            }
            if (isNaN(rating) || rating < 1 || rating > 99) {
                setFieldError("player-rating", "Rating must be 1-99.");
                hasError = true;
            }
            if (isNaN(cost) || cost < 0) {
                setFieldError("player-cost", "Cost must be positive.");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("position", position);
            formData.append("description", description);
            formData.append("rating", rating);
            formData.append("unlock_cost", cost);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            fetchMethod(currentUrl + "/api/catalogue", callbackForCreate, "POST", formData, token);
        };
    }
});
