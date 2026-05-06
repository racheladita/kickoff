document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMsg = document.getElementById("error-message");

    // ========== CALLBACKS ==========

    // Callback for login submission
    const callbackForLogin = (responseStatus, responseData) => {
        if (responseStatus === 200) {
            // Check if login was successful
            if (responseData.token) {
                // Store the token in local storage
                localStorage.setItem("token", responseData.token);
                localStorage.setItem("user_id", responseData.user_id);
                localStorage.setItem("username", responseData.username);
                // Redirect or perform further actions for logged-in user
                window.location.href = "index.html";
            }
        } else {
            // General error for invalid credentials
            let errorMsgText = "Invalid username or password";
            if (responseData.message) {
                errorMsgText = responseData.message;
            }

            if (errorMsg) {
                errorMsg.classList.remove("d-none");
                errorMsg.textContent = errorMsgText;
            } else {
                showMessage(errorMsgText);
            }
        }
    };

    // ========== FORM HANDLER ==========

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            // page does not refresh like a normal HTML form

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Reset errors
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }
            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!username.trim()) {
                setFieldError("username", "Username is required", "error-username");
                hasError = true;
            }

            if (!password.trim()) {
                setFieldError("password", "Password is required", "error-password");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            const loginData = {
                username: username.trim(),
                password: password.trim(),
            };

            fetchMethod(currentUrl + "/api/users/login", callbackForLogin, "POST", loginData);
            // calls backend route
            // 1. finds the user by username
            // 2. compares password with bcrypt
            // 3. generates a JWT
            // 4. sends JSON back including token + user info
        });
    }
});
