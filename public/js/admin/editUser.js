document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const adminId = localStorage.getItem("user_id");
    const errorMsg = document.getElementById("error-message");
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");
    const returnUrl = urlParams.get("returnUrl");

    if (!adminCheck()) {
        return;
    }

    if (!userId) {
        showMessage("Invalid user ID.", "adminUsers.html");
        return;
    }

    // Handle Return URL and Navigation
    handleFormReturnUrl("back-link", "cancel-link");

    // ========== CALLBACKS ==========

    // Callback for loading user data to prepopulate form
    const callbackForUserLoad = (status, user) => {
        if (status === 200) {
            const idField = document.getElementById("edit-user-id");
            const usernameField = document.getElementById("user-username");
            const emailField = document.getElementById("user-email");
            const passwordField = document.getElementById("user-password");
            const confirmPasswordField = document.getElementById("user-confirm-password");
            const pointsField = document.getElementById("user-points");

            if (idField) {
                idField.value = user.user_id;
            }
            if (usernameField) {
                usernameField.value = user.username;
            }
            if (emailField) {
                emailField.value = user.email;
            }
            if (passwordField) {
                passwordField.value = ""; // Don't populate password
            }
            if (confirmPasswordField) {
                confirmPasswordField.value = ""; // Don't populate password
            }
            if (pointsField) {
                let points = 0;
                if (user.points) {
                    points = user.points;
                }
                pointsField.value = points;
            }
        } else {
            handleAdminError(status, user, "User not found.", "adminUsers.html", "error-message");
        }
    };

    // Callback for updating user
    const callbackForUpdate = (status, result) => {
        if (status === 200) {
            let target = "adminUsers.html";
            if (returnUrl) {
                target = returnUrl;
            }
            showMessage("User updated successfully!", target);
        } else {
            handleAdminError(status, result, "Failed to update user.", null, "error-message");
        }
    };

    // ========== FORM HANDLER ==========

    const userForm = document.getElementById("edit-user-form");
    if (userForm) {
        userForm.onsubmit = function(event) {
            event.preventDefault();
            
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }

            const username = document.getElementById("user-username").value.trim();
            const email = document.getElementById("user-email").value.trim();
            const password = document.getElementById("user-password").value;
            const confirmPassword = document.getElementById("user-confirm-password").value;
            const pointsVal = document.getElementById("user-points").value;
            const points = parseInt(pointsVal);

            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!username) {
                setFieldError("user-username", "Username is required.", "error-username");
                hasError = true;
            } else if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9]+$/.test(username) || username.includes(" ")) {
                setFieldError("user-username", "Username must be 3-20 alphanumeric characters and can't contain spaces.", "error-username");
                hasError = true;
            }

            if (!email) {
                setFieldError("user-email", "Email is required.", "error-email");
                hasError = true;
            }

            if (password) {
                if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
                    setFieldError("user-password", "Password must be at least 6 characters with uppercase, number, and special character.", "error-password");
                    hasError = true;
                }
                if (password !== confirmPassword) {
                    setFieldError("user-confirm-password", "Passwords do not match.", "error-confirm-password");
                    hasError = true;
                }
            }

            if (isNaN(points) || points < 0) {
                setFieldError("user-points", "Points must be a positive number.", "error-points");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('points', points);
            
            if (password) {
                formData.append('password', password);
            }
            
            const fileInput = document.getElementById("edit-profile-pic");
            if (fileInput && fileInput.files.length > 0) {
                formData.append('profile_pic', fileInput.files[0]);
            }

            fetchMethod(currentUrl + "/api/users/" + userId, callbackForUpdate, "PUT", formData, token);
        };
    }

    // ========== INITIAL LOAD ==========
    fetchMethod(currentUrl + "/api/users/" + userId, callbackForUserLoad, "GET", null, token);
});
