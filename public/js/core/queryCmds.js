//=====================================================================================
// FETCH METHOD
// This function uses the fetch API to make a request to the server.
//=====================================================================================
function fetchMethod(url, callback, method = "GET", data = null, token = null) {
    console.log("fetchMethod: ", url, method, data, token);

    const headers = {};

    if (data) {
        if (!(data instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
    }

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    let options = {
        method: method.toUpperCase(),
        headers: headers,
    };

    if (method.toUpperCase() !== "GET" && data !== null) {
        if (data instanceof FormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }
    }

    fetch(url, options)
        .then((response) => {
            // === Auto-refresh token ===
            const newToken = response.headers.get('X-New-Token');
            if (newToken) {
                localStorage.setItem('token', newToken);
            }

            if (response.status == 204) {
                callback(response.status, {});
            } else {
                response.json().then((responseData) => callback(response.status, responseData));
            }
        })
        .catch((error) => {
            console.error(`Error from ${method} ${url}:`, error);
            if (typeof callback === "function") {
                callback(500, { message: "Network error or server unavailable" });
            }
        });
}

//=====================================================================================
// JQUERY METHOD
// This function uses the jQuery ajax method to make a request to the server.
//=====================================================================================
function jqueryMethod(url, callback, method = "GET", data = null, token = null) {
    console.log("jqueryMethod ", url, method, data, token);

    const headers = {};

    if (data) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const jqueryConfig = {
        url: url,
        type: method.toUpperCase(),
        headers: headers,
        data: data,
        dataType: "json",
        success: function (responseData, textStatus, jqXHR) {
            callback(jqXHR.status, responseData);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(`Error from ${method} ${url}:`, errorThrown);
        },
    };

    $.ajax(jqueryConfig);
}

//=====================================================================================
// AXIOS METHOD
// This function uses the axios method to make a request to the server.
//=====================================================================================
function axiosMethod(url, callback, method = "GET", data = null, token = null) {
    console.log("axiosMethod ", url, method, data, token);

    const headers = {};

    if (data) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const axiosConfig = {
        method: method.toUpperCase(),
        url: url,
        headers: headers,
        data: data,
    };

    axios(axiosConfig)
        .then((response) => callback(response.status, response.data))
        .catch((error) => console.error(`Error from ${method} ${url}:`, error));
}