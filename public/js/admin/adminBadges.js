document.addEventListener("DOMContentLoaded", function () {
    const badgeList = document.getElementById("badge-admin-list");
    const token = localStorage.getItem("token");

    if (!adminCheck()) {
        return;
    }

    // ========== CALLBACKS ==========

    // Callback for loading badges
    const callbackForBadges = (status, badges) => {
        if (!badgeList) {
            return;
        }

        if (status === 200) {
            if (!badges || badges.length === 0) {
                badgeList.innerHTML = '<tr><td colspan="5" class="text-center text-white py-5 opacity-75">No badges created yet.</td></tr>';
                return;
            }

            let i = 1;
            badgeList.innerHTML = badges.map(badge => {
                let imageSrc = badge.image || "../../images/trophy.png";

                return `
                    <tr>
                        <td class="px-3 fw-bold">${i++}</td>
                        <td><img src="${imageSrc}" alt="Badge Image ${i}" class="catalogue-img-sm rounded shadow-sm"></td>
                        <td class="fw-bold text-white">${badge.name}</td>
                        <td class="small opacity-75 d-none d-lg-table-cell">${badge.description}</td>
                        <td class="text-end pe-3">
                            <div class="d-flex justify-content-end gap-2">
                                <a href="editBadge.html?id=${badge.badge_id}" class="btn btn-sm btn-outline-light" title="Edit">
                                    <i class="fas fa-edit"></i><span class="d-none d-md-block">Edit</span>
                                </a>
                                <button onclick="deleteBadge(${badge.badge_id})" class="btn btn-sm btn-delete-red" title="Delete">
                                    <i class="fas fa-trash-alt"></i><span class="d-none d-md-block">Delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            handleTableError("badge-admin-list", 5, "Error loading badges.", "retryLoadBadges", status);
        }
    };

    // ========== FUNCTIONS ==========

    window.retryLoadBadges = function () {
        handleTableLoading("badge-admin-list", 5, "Loading badges...");
        fetchMethod(currentUrl + "/api/badges", callbackForBadges, "GET", null, token);
    };

    window.deleteBadge = function (id) {
        executeAdminDelete(currentUrl + "/api/badges/" + id, "Badge deleted.", retryLoadBadges, "Remove this badge from the system?");
    };

    // ========== INITIAL LOAD ==========
    retryLoadBadges();
});
