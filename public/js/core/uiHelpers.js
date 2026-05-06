//=====================================================================================
// LOGOUT HELPER
//=====================================================================================
function handleLogout(showAlert = false) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    
    if (showAlert) {
        if (typeof showMessage === "function") {
            showMessage("Your session has expired or access denied. Please log in again.", "login.html");
        } else {
            alert("Your session has expired or access denied. Please log in again.");
            window.location.href = "login.html";
        }
    } else {
        window.location.href = "login.html";
    }
}

//=====================================================================================
// API ERROR HANDLER
//=====================================================================================
function handleApiError(status, result, fallbackMsg, targetUrl = null, errorElementId = null) {
    if (status === 401 || status === 403) {
        handleLogout(true);
        return true;
    }

    let message = "";
    if (result && result.message) {
        message = result.message;
    } else {
        message = fallbackMsg;
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

//=====================================================================================
// AUTH CHECK
//=====================================================================================
function checkAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

//=====================================================================================
// SESSION CHECK
//=====================================================================================
function checkSession() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout(true); // This will trigger the modal
            return false;
        }
        return true;
    } catch (e) {
        console.error("checkSession error:", e);
        window.location.href = "login.html";
        return false;
    }
}

//=====================================================================================
// MESSAGE MODAL HELPER
//=====================================================================================
let globalMessageModal;
function showMessage(msg, redirectUrl = null) {
    const messageModalEl = document.getElementById('messageModal');
    
    if (!messageModalEl) {
        alert(msg);
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
        return;
    }

    if (!globalMessageModal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            globalMessageModal = new bootstrap.Modal(messageModalEl);
        } else {
            alert(msg);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            return;
        }
    }

    const modalBody = messageModalEl.querySelector('.modal-body');
    if (modalBody) modalBody.innerHTML = `<p class="mb-0 text-center">${msg}</p>`;

    const modalFooter = messageModalEl.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
          <button type="button" class="btn btn-white " id="message-ok-btn">OK</button>
        `;
        // Handle OK button - redirect directly on click
        document.getElementById('message-ok-btn').onclick = () => {
            globalMessageModal.hide();
            if (redirectUrl) {
                // Small delay to let modal close animation complete
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 150);
            }
        };
    }
    
    globalMessageModal.show();
}

//=====================================================================================
// BADGE EARNED MODAL HELPER
//=====================================================================================
function showBadgeEarned(badges, baseMessage, redirectUrl = null) {
    // If no badges, just show a plain message (without redirect for badge modal)
    if (!badges || badges.length === 0) {
        showMessage(baseMessage, redirectUrl);
        return;
    }

    let badgeList = [badges];
    if (Array.isArray(badges)) {
        badgeList = badges;
    }

    const badgeNames = badgeList.map(badge => {
        if (typeof badge === 'string') {
            return badge;
        } else {
            return badge.name;
        }
    });

    const messageModalEl = document.getElementById('messageModal');
    if (!messageModalEl) {
        alert(`${baseMessage}\n\n🏆 ACHIEVEMENT UNLOCKED: ${badgeNames.join(", ")}`);
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
        return;
    }

    // Reuse the global modal
    if (!globalMessageModal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            globalMessageModal = new bootstrap.Modal(messageModalEl);
        } else {
            alert(baseMessage);
            return;
        }
    }

    const modalBody = messageModalEl.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="badge-award-container text-center">
                <div class="badge-icon-reveal pb-2">
                    <i class="fas fa-trophy fa-4x text-warning trophy-animation"></i>
                </div>
                <h2 class="text-white mb-2">Achievement Unlocked!</h2>
                <p class="text-white text-opacity-75 mb-4">${baseMessage}</p>
                <div class="d-flex flex-wrap justify-content-center gap-2">
                    ${badgeList.map(badge => {
                        let badgeContent = `<i class="fas fa-medal text-primary d-block mb-1 h2"></i>`;
                        if (badge.image) {
                            badgeContent = `<img src="${badge.image}" alt="${badge.name}" class="d-block mx-auto badge-img-lg">`;
                        }

                        return `
                            <div class="badge-item glass p-3 rounded text-center">
                                ${badgeContent}
                                <span class="text-white small fw-bold d-block">${badge.name}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    const modalFooter = messageModalEl.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
          <button type="button" class="btn btn-secondary px-4 fw-bold" id="badge-confirm-btn">AWESOME!</button>
        `;
        
        // Click handler - redirect directly on button click
        document.getElementById('badge-confirm-btn').onclick = () => {
            globalMessageModal.hide();
            if (redirectUrl) {
                // Small delay to let modal close animation complete
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 150);
            }
        };
    }
    
    globalMessageModal.show();
}

//=====================================================================================
// CONFIRMATION MODAL HELPER
//=====================================================================================
function showConfirm(msg, onConfirm) {
    const messageModalEl = document.getElementById('messageModal');
    
    if (!messageModalEl) {
        if (confirm(msg)) onConfirm();
        return;
    }

    if (!globalMessageModal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            globalMessageModal = new bootstrap.Modal(messageModalEl);
        } else {
            if (confirm(msg)) onConfirm();
            return;
        }
    }

    // IMPORTANT: Clear any pending redirect BEFORE showing confirm dialog
    messageModalEl.dataset.redirect = "";

    const modalBody = messageModalEl.querySelector('.modal-body');
    if (modalBody) modalBody.innerHTML = `<p class="mb-0 text-center">${msg}</p>`;

    const modalFooter = messageModalEl.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
          <button type="button" class="btn btn-pink " data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-white " id="modal-confirm-btn">Confirm</button>
        `;
        document.getElementById('modal-confirm-btn').onclick = () => {
            // Clear redirect again to prevent race condition with next modal
            messageModalEl.dataset.redirect = "";
            globalMessageModal.hide();
            // Use setTimeout to ensure modal is fully hidden before calling onConfirm
            setTimeout(() => {
                onConfirm();
            }, 300);
        };
    }
    
    globalMessageModal.show();
}

//=====================================================================================
// PROMPT MODAL HELPER
//=====================================================================================
function showPrompt(msg, onConfirm) {
    const messageModalEl = document.getElementById('messageModal');
    
    if (!messageModalEl) {
        const input = prompt(msg);
        if (input !== null) onConfirm(input);
        return;
    }

    if (!globalMessageModal) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            globalMessageModal = new bootstrap.Modal(messageModalEl);
        } else {
            const input = prompt(msg);
            if (input !== null) onConfirm(input);
            return;
        }
    }

    const modalBody = messageModalEl.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <p class="mb-3 text-center">${msg}</p>
            <div class="form-group">
                <textarea id="modal-prompt-input" class="form-control form-control-sm bg-light opacity-75 border-secondary" rows="3" placeholder="Enter your progress notes here..."></textarea>
            </div>
        `;
    }

    const modalFooter = messageModalEl.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
          <button type="button" class="btn btn-pink " data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-white " id="modal-confirm-btn">Confirm</button>
        `;
        document.getElementById('modal-confirm-btn').onclick = () => {
            const inputVal = document.getElementById('modal-prompt-input').value.trim();
            globalMessageModal.hide();
            onConfirm(inputVal);
        };
    }
    
    messageModalEl.dataset.redirect = "";
    globalMessageModal.show();
}

//=====================================================================================
// VALIDATION HELPERS
//=====================================================================================
function setFieldError(inputId, message, errorId = null) {  
    let actualErrorId = `error-${inputId.replace('edit-', '').replace('player-', '').replace('badge-', '')}`;
    if (errorId) {
        actualErrorId = errorId;
    }
    const errorEl = document.getElementById(actualErrorId);
    if (errorEl) {
        errorEl.innerText = message;
        errorEl.classList.remove("d-none");
    }
}

function clearFieldErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.classList.add("d-none"));
}

//=====================================================================================
// FORMATTING HELPERS
//=====================================================================================
function formatPoints(amount) {
    if (amount === undefined || amount === null) {
        return "0";
    }
    return Number(amount).toLocaleString();
}

function isToday(dateStr) {
    if (!dateStr) {
        return false;
    }
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function formatDate(dateStr, includeTime = false) {
    if (!dateStr) {
        return "N/A";
    }
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return new Date(dateStr).toLocaleDateString('en-GB', options);
}

//=====================================================================================
// PAGINATION HELPERS
//=====================================================================================
function paginateArray(array, page, limit) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return array.slice(start, end);
}

/**
 * Renders a standard Bootstrap pagination UI
 * @param {string} containerId - The ID of the element to inject the pager into
 * @param {number} totalItems - Total count of items in the full list
 * @param {number} currentPage - Current active page number
 * @param {number} limit - Items per page
 * @param {string} onPageChangeName - Global function name to call when page changes (e.g. "changePage")
 */
function renderPager(containerId, totalItems, currentPage, limit, onPageChangeName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / limit);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let itemsHtml = "";
    
    // Previous Button
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    itemsHtml += `
        <li class="page-item ${prevDisabled}">
            <button class="page-link glass border-0 text-white" onclick="${onPageChangeName}(${currentPage - 1})">
                <i class="fas fa-chevron-left small"></i>
            </button>
        </li>
    `;

    // Page Numbers (Simplified logic)
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        const activeStyle = isActive ? "bg-page" : "";
        itemsHtml += `
            <li class="page-item ${isActive ? 'active' : ''}">
                <button class="page-link glass mx-1 border-0 text-white ${activeStyle}" onclick="${onPageChangeName}(${i})">${i}</button>
            </li>
        `;
    }

    // Next Button
    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    itemsHtml += `
        <li class="page-item ${nextDisabled}">
            <button class="page-link glass border-0 text-white" onclick="${onPageChangeName}(${currentPage + 1})">
                <i class="fas fa-chevron-right small"></i>
            </button>
        </li>
    `;

    container.innerHTML = `
        <nav aria-label="Page navigation" class="mt-5">
            <ul class="pagination justify-content-center">
                ${itemsHtml}
            </ul>
        </nav>
    `;
}

window.checkSession = checkSession;
window.showMessage = showMessage;
window.showBadgeEarned = showBadgeEarned;
window.setFieldError = setFieldError;
window.clearFieldErrors = clearFieldErrors;
window.handleLogout = handleLogout;
window.checkAuth = checkAuth;
window.showConfirm = showConfirm;
window.showPrompt = showPrompt;
window.formatPoints = formatPoints;
window.isToday = isToday;
window.formatDate = formatDate;
window.paginateArray = paginateArray;
window.renderPager = renderPager;
window.handleApiError = handleApiError;
