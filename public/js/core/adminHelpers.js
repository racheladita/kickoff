//=====================================================================================
// ADMIN CORE HELPERS
//=====================================================================================

//Combined authentication and admin privilege check.
//Returns true if the user is logged in and has admin ID (1).
function adminCheck() {
    if (typeof checkAuth === "function") {
        if (!checkAuth()) {
            return false;
        }
    }

    const userId = localStorage.getItem("user_id");
    if (userId != 1) {
        if (typeof showMessage === "function") {
            showMessage("Access Denied: Admin only.", "index.html");
        } else {
            alert("Access Denied: Admin only.");
            window.location.href = "index.html";
        }
        return false;
    }
    return true;
}

//Centralized logic for returnUrl navigation in forms.
function handleFormReturnUrl(backLinkId, cancelLinkId) {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl");
    
    if (returnUrl) {
        const backLink = document.getElementById(backLinkId);
        const cancelLink = document.getElementById(cancelLinkId);
        if (backLink)  {
            backLink.href = returnUrl;
        }
        if (cancelLink) {
            cancelLink.href = returnUrl;
        }
    }
}

//=====================================================================================
// TABLE UI HELPERS
//=====================================================================================

function handleTableLoading(tableId, colSpan = 7, message = "Fetching records...") {
    const table = document.getElementById(tableId);
    if (!table) {
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="${colSpan}" class="text-center py-5">
                <div class="loader-ball">
                    <i class="fas fa-futbol"></i>
                </div>
                <p class="mt-2 text-white">${message}</p>
            </td>
        </tr>
    `;
}

function handleTableError(tableId, colSpan = 7, message = "Failed to load data.", retryFnName = "retryLoad", status = null) {
    if (status === 401 || status === 403) {
        if (typeof handleLogout === "function") {
            showMessage("Session expired. Please login again.", "login.html");
            handleLogout(false);
        } else {
            localStorage.clear();
            window.location.href = "login.html";
        }
        return;
    }

    const table = document.getElementById(tableId);
    if (!table) {
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="${colSpan}" class="text-center py-5">
                <p class="text-danger mb-3">${message}</p>
                <button onclick="${retryFnName}()" class="btn btn-outline-light">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </td>
        </tr>
    `;
}

//=====================================================================================
// DELETE FLOW HELPER
//=====================================================================================

// Standardizes the Confirm -> Delete -> Message -> Refresh flow.
function executeAdminDelete(url, successMsg, refreshFn, confirmMsg = "Are you sure? This action cannot be undone.") {
    const token = localStorage.getItem("token");
    
    const callbackForFetch = (status, result) => {
        if (status === 204 || status === 200) {
            if (typeof showMessage === "function") {
                showMessage(successMsg);
            } else {
                alert(successMsg);
            }
            
            if (refreshFn && typeof refreshFn === "function") {
                refreshFn();
            }
        } else {
            handleAdminError(status, result, "Action failed.");
        }
    };

    const performDelete = () => {
        if (typeof fetchMethod === "function") {
            fetchMethod(url, callbackForFetch, "DELETE", null, token);
        }
    };

    if (typeof showConfirm === "function") {
        showConfirm(confirmMsg, performDelete);
    } else if (confirm(confirmMsg)) {
        performDelete();
    }
}

// Handles session expiration (401/403) and shows error messages for others.
function handleAdminError(status, result, fallbackMsg, targetUrl = null, errorElementId = null) {
    if (status === 401 || status === 403) {
        if (typeof handleLogout === "function") {
            showMessage("Session expired or unauthorized. Please login again.", "login.html");
            handleLogout(false);
        } else {
            localStorage.clear();
            showMessage("Session expired or unauthorized. Please login again.", "login.html");
        }
        return true;
    }

    let message = fallbackMsg;
    if (result && result.message) {
        message = result.message;
    }

    if (errorElementId) {
        const errorEl = document.getElementById(errorElementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove("d-none");
            return false;
        }
    }

    if (typeof showMessage === "function") {
        showMessage("Error: " + message, targetUrl);
    } else {
        alert("Error: " + message);
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    }
    return false;
}

// Global Exports
window.adminCheck = adminCheck;
window.handleFormReturnUrl = handleFormReturnUrl;
window.handleTableLoading = handleTableLoading;
window.handleTableError = handleTableError;
window.executeAdminDelete = executeAdminDelete;
window.handleAdminError = handleAdminError;
