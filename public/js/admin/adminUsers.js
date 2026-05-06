document.addEventListener("DOMContentLoaded", function () {
    const userList = document.getElementById("user-admin-list");
    const token = localStorage.getItem("token");

    if (!adminCheck()) {
        return;
    }

    // ========== CALLBACKS ==========

    // Callback for loading users
    const callbackForUsers = (status, users) => {
        if (!userList) {
            return;
        }

        if (status === 200) {
            if (!users || users.length === 0) {
                userList.innerHTML = '<tr><td colspan="7" class="text-center text-white py-5 opacity-75">No user records found in the database.</td></tr>';
                return;
            }
            
            let i = 1;
            userList.innerHTML = users.map(user => {
                let profilePic = user.profile_pic || "../../images/user.png";
                let points = formatPoints(user.points);
                let dateString = formatDate(user.created_at);

                let deleteButton = "";
                if (user.user_id != 1) {
                    deleteButton = `
                        <button onclick="deleteUser(${user.user_id})" class="btn btn-sm btn-delete-red" title="Delete">
                            <i class="fas fa-trash-alt"></i><span class="d-none d-md-block">Delete</span>
                        </button>
                    `;
                }

                return `
                    <tr>
                        <td class="fw-bold px-3">${i++}</td>
                        <td class="fw-bold text-white">${user.username}</td>
                        <td class="small opacity-75 d-none d-lg-table-cell">${user.email}</td>
                        <td><span class="badge text-pink">${points} PTS</span></td>
                        <td class="small opacity-75 d-none d-lg-table-cell">${dateString}</td>
                        <td>
                            <div class="icon-circle p-2 rounded-circle bg-white shadow">
                                <img src="${profilePic}" alt="Profile" class="object-fit-cover w-100 h-100 bg-white rounded-circle shadow-sm">
                            </div>
                        </td>
                        <td class="text-end pe-3">
                            <div class="d-flex justify-content-end gap-2">
                                <a href="editUser.html?id=${user.user_id}" class="btn btn-sm btn-outline-light" title="Edit">
                                    <i class="fas fa-edit"></i><span class="d-none d-md-block">Edit</span>
                                </a>
                                ${deleteButton}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            handleTableError("user-admin-list", 7, "Failed to load user data.", "retryLoadUsers", status);
        }
    };

    // ========== FUNCTIONS ==========

    window.retryLoadUsers = function() {
        handleTableLoading("user-admin-list", 7, "Fetching user records...");
        fetchMethod(currentUrl + "/api/users", callbackForUsers, "GET", null, token);
    };

    window.deleteUser = function (id) {
        executeAdminDelete(currentUrl + "/api/users/" + id, "User deleted successfully.", retryLoadUsers, "Are you sure you want to delete this user? This action cannot be undone.");
    };

    // ========== INITIAL LOAD ==========
    retryLoadUsers();
});
