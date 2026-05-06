document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const errorMsg = document.getElementById("error-message");

    // ========== CALLBACKS ==========

    // Callback for auto-login after successful registration
    const callbackForAutoLogin = (loginStatus, loginResult) => {
        if (loginStatus === 200) {
            localStorage.setItem("token", loginResult.token);
            localStorage.setItem("user_id", loginResult.user_id);
            localStorage.setItem("username", loginResult.username);
            showMessage("Welcome aboard! Registration successful. Logging you in...", "index.html");
        } else {
            // Fallback if auto-login fails
            showMessage("Registration successful! Please login.", "login.html");
        }
    };

    // ========== FUNCTIONS ==========

    function executeRegisterUser(username, email, password) {
        const registrationData = {
            username: username,
            email: email,
            password: password
        };

        const callback = (status, data) => {
            if (status === 200 || status === 201) {
                // Auto-login logic
                const loginData = { 
                    username: username, 
                    password: password 
                };
                fetchMethod(currentUrl + "/api/users/login", callbackForAutoLogin, "POST", loginData);
            } else {
                // Handle cases like "User already exists"
                let errorMsgText = "Registration failed. Please try again.";
                if (data.message) {
                    errorMsgText = data.message;
                }

                if (errorMsg) {
                    errorMsg.textContent = errorMsgText;
                    errorMsg.classList.remove("d-none");
                } else {
                    showMessage(errorMsgText);
                }
            }
        };

        fetchMethod(currentUrl + "/api/users", callback, "POST", registrationData);
    }

    // ========== FORM HANDLER ==========

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Reset errors
            if (typeof clearFieldErrors === "function") {
                clearFieldErrors();
            }
            if (errorMsg) {
                errorMsg.classList.add("d-none");
            }

            let hasError = false;

            if (!username || !/^[a-zA-Z0-9]{3,20}$/.test(username) || username.includes(" ")) {
                setFieldError("username", "Username must be 3-20 alphanumeric characters and can't contain spaces", "error-username");
                hasError = true;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFieldError("email", "Please enter a valid email address", "error-email");
                hasError = true;
            }

            if (password.length === 0) {
                setFieldError("password", "Password is required", "error-password");
                hasError = true;
            } else if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
                setFieldError("password", "Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special character", "error-password");
                hasError = true;
            }

            if (password !== confirmPassword) {
                setFieldError("confirm-password", "Passwords do not match", "error-confirm-password");
                hasError = true;
            }

            if (hasError) {
                return;
            }

            executeRegisterUser(username, email, password);
        });
    }
});
