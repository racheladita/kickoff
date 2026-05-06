document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("error-message");
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get("id");
    const returnUrl = urlParams.get("returnUrl");

    if (!adminCheck()) {
        return;
    }

    if (!playerId) {
        showMessage("Invalid player ID.", "adminPlayers.html");
        return;
    }

    // Handle Return URL and Navigation
    handleFormReturnUrl("back-link", "cancel-link");

    // ========== CALLBACKS ==========

    // Callback for loading player data to prepopulate form
    const callbackForPlayerLoad = (status, player) => {
        if (status === 200) {
            const idField = document.getElementById("player-id");
            const nameField = document.getElementById("player-name");
            const positionField = document.getElementById("player-position");
            const descriptionField = document.getElementById("player-description");
            const ratingField = document.getElementById("player-rating");
            const costField = document.getElementById("player-cost");

            if (idField) {
                idField.value = player.catalogue_id;
            }
            if (nameField) {
                nameField.value = player.name;
            }
            if (positionField) {
                positionField.value = player.position;
            }
            if (descriptionField) {
                descriptionField.value = player.description;
            }
            if (ratingField) {
                ratingField.value = player.rating;
            }
            if (costField) {
                costField.value = player.unlock_cost;
            }
            // Note: image field is handled separately if needed for preview
        } else {
            handleAdminError(status, player, "Player not found.", "adminPlayers.html", "error-message");
        }
    };

    // Callback for updating player
    const callbackForUpdate = (status, result) => {
        if (status === 200) {
            let target = "adminPlayers.html";
            if (returnUrl) {
                target = returnUrl;
            }
            showMessage("Player updated successfully!", target);
        } else {
            handleAdminError(status, result, "Failed to update player.", null, "error-message");
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
            const description = document.getElementById("player-description").value.trim();
            const ratingVal = document.getElementById("player-rating").value;
            const costVal = document.getElementById("player-cost").value;
            const rating = parseInt(ratingVal);
            const cost = parseInt(costVal);

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
            
            const fileInput = document.getElementById("player-image");
            if (fileInput && fileInput.files.length > 0) {
                formData.append('image', fileInput.files[0]);
            }

            fetchMethod(currentUrl + "/api/catalogue/" + playerId, callbackForUpdate, "PUT", formData, token);
        };
    }

    // ========== INITIAL LOAD ==========
    fetchMethod(currentUrl + "/api/catalogue/" + playerId, callbackForPlayerLoad, "GET", null, token);
});
