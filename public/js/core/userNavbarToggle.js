document.addEventListener("DOMContentLoaded", function () {
    const authLink = document.getElementById("auth-link");
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("user_id");

    // Fix: Handle scroll for transparent navbar
    const header = document.querySelector("header");
    if (!header) {
        return;
    }

    // Treat pages with .hero OR .background-page as pages that start transparent
    let isHeroPage = false;
    if (document.querySelector(".hero") !== null || document.querySelector("body.background-page") !== null) {
        isHeroPage = true;
    }

    // Adjust Navbar Breakpoint for Admins (Admin Panel adds menu length)
    const navbar = document.getElementById("navbar");
    if (navbar && parseInt(userId) === 1) {
        navbar.classList.remove("navbar-expand-lg");
        navbar.classList.add("navbar-expand-xl");
    }

    if (!isHeroPage) {
        header.classList.add("scrolled");
    }

    window.addEventListener("scroll", function() {
        if (isHeroPage) {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    });

    // ========== NAVIGATION LINKS ==========
    const navLinks = document.getElementById("nav-links") || 
                     document.querySelector(".nav-links") || 
                     document.querySelector(".navbar-nav");
    
    const isBootstrapNav = navLinks && navLinks.classList.contains("navbar-nav");

    if (navLinks) {
        const currentPath = window.location.pathname;

        // Define all public links in order
        const publicLinks = [
            { name: "Home", url: "index.html" },
            { name: "Challenges", url: "challenges.html" },
            { name: "Transfer Market", url: "market.html" },
            { name: "Matches", url: "matches.html" }
        ];

        // Add public links if they don't exist
        publicLinks.forEach(link => {
            const linkId = `nav-${link.name.toLowerCase().replace(/\s+/g, '-')}-link`;
            if (!document.getElementById(linkId)) {
                const li = document.createElement("li");
                li.id = linkId;
                if (isBootstrapNav) {
                    li.className = "nav-item";
                }
                
                let isActive = false;
                if (currentPath.endsWith(link.url) || (currentPath === "/" && link.url === "index.html")) {
                    isActive = true;
                }
                
                let activeClass = "";
                if (isActive) {
                    activeClass = "active";
                }

                let linkClass = "text-white fw-bold";
                if (isBootstrapNav) {
                    linkClass = "nav-link text-white fw-bold";
                }
                
                li.innerHTML = `<a href="${link.url}" class="${linkClass} ${activeClass}">${link.name}</a>`;
                
                if (authLink && authLink.parentNode === navLinks) {
                    navLinks.insertBefore(li, authLink);
                } else {
                    navLinks.appendChild(li);
                }
            }
        });
    }

    // ========== LOGGED IN USER UI ==========
    if (token && username) {
        // Add points display to logo
        const logoDiv = document.querySelector(".logo");
        if (logoDiv && !document.getElementById("nav-points-display")) {
            const pointsSpan = document.createElement("span");
            pointsSpan.id = "nav-points-display";
            pointsSpan.className = "nav-points d-none";
            pointsSpan.innerHTML = `<i class="fas fa-coins"></i> <span id="nav-user-points">0</span>`;
            pointsSpan.style.marginLeft = "1rem"; 
            logoDiv.appendChild(pointsSpan);
        }

        // Add Admin Dropdown for Superadmins
        if (navLinks && parseInt(userId) === 1 && !document.getElementById("admin-dropdown")) {
            const currentPath = window.location.pathname;
            const adminLinks = [
                { name: "Dashboard", url: "admin.html", icon: "fa-th-large" },
                { name: "Users", url: "adminUsers.html", icon: "fa-users" },
                { name: "Player Catalogue", url: "adminPlayers.html", icon: "fa-running" },
                { name: "Challenges", url: "adminChallenges.html", icon: "fa-bullseye" },
                { name: "Badges", url: "adminBadges.html", icon: "fa-medal" },
                { name: "Teams", url: "adminTeams.html", icon: "fa-shield-alt" }
            ];

            let isAdminActive = false;
            const adminMenuItemsHtml = adminLinks.map(link => {
                const isActive = currentPath.endsWith(link.url);
                if (isActive) {
                    isAdminActive = true;
                }

                let itemActiveClass = "";
                if (isActive) {
                    itemActiveClass = "active";
                }

                return `<a href="${link.url}" class="dropdown-item ${itemActiveClass}"><i class="fas ${link.icon}"></i> ${link.name}</a>`;
            }).join('');

            const adminLi = document.createElement("li");
            adminLi.id = "admin-dropdown";
            
            if (isBootstrapNav) {
                adminLi.className = "nav-item dropdown";
            } else {
                adminLi.className = "dropdown";
            }

            let adminToggleClass = "dropdown-toggle";
            if (isBootstrapNav) {
                adminToggleClass = "dropdown-toggle nav-link text-white fw-bold";
            }
            if (isAdminActive) {
                adminToggleClass += " active text-pink";
            }

            adminLi.innerHTML = `
                <a href="javascript:void(0)" class="${adminToggleClass}" id="adminToggle">Admin Panel</a>
                <div class="dropdown-menu mt-lg-3 mt-1" id="adminMenu">
                    ${adminMenuItemsHtml}
                </div>
            `;
            
            if (authLink && authLink.parentNode === navLinks) {
                navLinks.insertBefore(adminLi, authLink);
            } else {
                navLinks.appendChild(adminLi);
            }
        }

        // Update auth link to show user dropdown
        if (authLink) {
            if (isBootstrapNav) {
                authLink.className = "nav-item";
            }
            
            const currentPath = window.location.pathname;
            const isProfileActive = currentPath.endsWith("profile.html");
            const isTeamActive = currentPath.endsWith("team.html");

            let containerClass = "d-flex align-items-center";
            if (isBootstrapNav) {
                containerClass = "d-flex align-items-center justify-content-center";
            }

            let dropdownBtnActiveClass = "";
            if (isProfileActive || isTeamActive) {
                dropdownBtnActiveClass = "active";
            }

            let profileActiveClass = "";
            if (isProfileActive) {
                profileActiveClass = "active";
            }

            let teamActiveClass = "";
            if (isTeamActive) {
                teamActiveClass = "active";
            }
            
            authLink.innerHTML = `
                <div class="${containerClass}">
                    <div class="dropdown" id="userDropdown">
                        <button class="btn btn-white fw-bold dropdown-toggle ${dropdownBtnActiveClass}" id="dropdownToggle">
                            Hi, ${username}!
                        </button>
                        <div class="dropdown-menu mt-lg-2 mt-1" id="dropdownMenu">
                            <a href="profile.html" class="dropdown-item ${profileActiveClass}"><i class="fas fa-user-circle"></i> Profile</a>
                            <a href="team.html" class="dropdown-item ${teamActiveClass}"><i class="fas fa-users"></i> My Team</a>
                            <button id="logoutButton" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Logout</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ========== UPDATE NAV POINTS FUNCTION ==========
    // Define callback first
    const callbackForNavPoints = (status, data) => {
        if (status === 200) {
            const pointsDisplay = document.getElementById("nav-points-display");
            const pointsValue = document.getElementById("nav-user-points");
            if (pointsDisplay && pointsValue) {
                pointsValue.textContent = formatPoints(data.points);
                pointsDisplay.classList.remove("d-none");
            }
        }
    };

    // Use window to make function global so it can be called from other files
    window.updateNavPoints = function() {
        if (token && userId && typeof fetchMethod === "function") {
            fetchMethod(currentUrl + "/api/users/" + userId, callbackForNavPoints, "GET", null, token);
        }
    };

    // ========== DROPDOWN EVENT HANDLERS ==========
    
    // Global function to check login before navigation
    window.checkLogin = function(event) {
        const currentToken = localStorage.getItem("token");
        if (!currentToken) {
            event.preventDefault();
            showMessage("Please log in to access this feature.", "login.html");
        }
        // If logged in, do nothing and let the default link href work
    };

    if (token && username) {
        // Call updateNavPoints on page load
        updateNavPoints();

        const toggle = document.getElementById("dropdownToggle");
        const menu = document.getElementById("dropdownMenu");
        const dropdown = document.getElementById("userDropdown");

        const adminToggle = document.getElementById("adminToggle");
        const adminMenu = document.getElementById("adminMenu");
        const adminDropdown = document.getElementById("admin-dropdown");

        // User dropdown toggle
        if (toggle && menu) {
            toggle.addEventListener("click", function (event) {
                event.stopPropagation();
                if (adminMenu) {
                    adminMenu.classList.remove("show");
                }
                menu.classList.toggle("show");
                dropdown.classList.toggle("active");
            });
        }

        // Admin dropdown toggle
        if (adminToggle && adminMenu) {
            adminToggle.addEventListener("click", function (event) {
                event.stopPropagation();
                if (menu) {
                    menu.classList.remove("show");
                }
                adminMenu.classList.toggle("show");
                adminDropdown.classList.toggle("active");
            });
        }

        // Close dropdowns when clicking outside
        window.addEventListener("click", function () {
            if (menu) {
                menu.classList.remove("show");
            }
            if (dropdown) {
                dropdown.classList.remove("active");
            }
            if (adminMenu) {
                adminMenu.classList.remove("show");
            }
            if (adminDropdown) {
                adminDropdown.classList.remove("active");
            }
        });

        // Logout button handler
        const logoutBtn = document.getElementById("logoutButton");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(event) {
                event.preventDefault();
                handleLogout(false);
            });
        }
    } else {
        // Show login button for guests
        if (authLink) {
            authLink.innerHTML = `<a href="login.html" class="btn btn-white">Login</a>`;
        }
    }
});