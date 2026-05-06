document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("error-message");

    if (!adminCheck()) {
        return;
    }

    // ========== CALLBACKS ==========

    // Callback for creating a badge
    const callbackForCreate = (status, result) => {
        if (status === 201) {
            showMessage("Badge created successfully!", "adminBadges.html");
        } else {
            handleAdminError(status, result, "Failed to create badge.", null, "error-message");
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
            const imageFile = document.getElementById("badge-image").files[0];

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
            if (imageFile) {
                formData.append("image", imageFile);
            }

            fetchMethod(currentUrl + "/api/badges", callbackForCreate, "POST", formData, token);
        };
    }
});
