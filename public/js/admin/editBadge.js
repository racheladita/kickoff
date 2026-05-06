document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("error-message");
    const urlParams = new URLSearchParams(window.location.search);
    const badgeId = urlParams.get("id");

    if (!adminCheck()) {
        return;
    }

    if (!badgeId) {
        showMessage("Invalid badge ID.", "adminBadges.html");
        return;
    }

    // ========== CALLBACKS ==========

    // Callback for loading badge data to prepopulate form
    const callbackForBadgeLoad = (status, badge) => {
        if (status === 200) {
            const idField = document.getElementById("badge-id");
            const nameField = document.getElementById("badge-name");
            const descriptionField = document.getElementById("badge-description");

            if (idField) {
                idField.value = badge.badge_id;
            }
            if (nameField) {
                nameField.value = badge.name;
            }
            if (descriptionField) {
                descriptionField.value = badge.description;
            }
            // Note: image field is handled separately if needed for preview
        } else {
            handleAdminError(status, badge, "Badge not found.", "adminBadges.html", "error-message");
        }
    };

    // Callback for updating badge
    const callbackForUpdate = (status, result) => {
        if (status === 200) {
            showMessage("Badge updated successfully!", "adminBadges.html");
        } else {
            handleAdminError(status, result, "Failed to update badge.", null, "error-message");
        }
    };

    // ========== FORM HANDLER ==========

    const badgeForm = document.getElementById("badge-form");
    if (badgeForm) {
        badgeForm.onsubmit = function(event) {
            event.preventDefault();
            
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }

            const name = document.getElementById("badge-name").value.trim();
            const description = document.getElementById("badge-description").value.trim();

            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!name) {
                setFieldError("badge-name", "Badge name is required.");
                hasError = true;
            }
            if (!description) {
                setFieldError("badge-description", "Description is required.");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            
            const fileInput = document.getElementById("badge-image");
            if (fileInput && fileInput.files.length > 0) {
                formData.append('image', fileInput.files[0]);
            }

            fetchMethod(currentUrl + "/api/badges/" + badgeId, callbackForUpdate, "PUT", formData, token);
        };
    }

    // ========== INITIAL LOAD ==========
    fetchMethod(currentUrl + "/api/badges/" + badgeId, callbackForBadgeLoad, "GET", null, token);
});
