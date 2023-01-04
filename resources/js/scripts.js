import {getUserDetails, getUserFavoriteLanguage} from "./github-apis.js";

// Specify required fields of user to be shown in page
const REQUIRED_FIELDS = ['avatar_url', 'name', 'company', 'blog', 'location', 'email', 'bio']

// Call fetchUserData(event) on submit form
document.forms['user-input'].addEventListener('submit', fetchUserData);

// Call hideNotification() on toast close button
document.getElementById('toast-close').addEventListener('click', hideNotification);

function fetchUserData(e) {
    e.preventDefault();
    hideNotification();
    const username = new FormData(e.target).get('github_username').toString();

    // Enter loading mode
    loadingMode();

    // Call GitHub apis or use local storage to get user info
    getCompleteUserInfo(username)
        .then(userInfo => {
            updateUserDetailField(userInfo);
            return userInfo;
        })
        // Update local storage
        .then(userInfo => localStorage.setItem(username, JSON.stringify(userInfo)))
        // Show success notification
        .then(() => showNotification('SUCCESS', 'Userinfo fetched successfully.'))
        // Handle any error
        .catch(err => {
            console.error(err);
            // If the error is 'User with that username not found'
            if (err.toString() === 'HttpError: Not Found')
                showNotification("ERROR", `There is no such user with username ${username}`);
            // Any error like network error
            else
                showNotification("ERROR", err.toString());
        })
        // Quit loading mode
        .then(endLoadingMode);
}

async function getCompleteUserInfo(username) {
    // Return from local storage if its cached
    if (localStorage[username])
        return Promise.resolve(JSON.parse(localStorage[username]));

    // Call Github api to get user details
    return getUserDetails(username)
        // Filter given data and turn it into string
        .then(response => JSON.stringify(response, REQUIRED_FIELDS))
        .then(details => {
            // Now get user's favorite language
            return getUserFavoriteLanguage(username)
                .then(response => {
                    // Now join it to another user details
                    const user_info = JSON.parse(details);
                    user_info['fav_lang'] = response;
                    return user_info;
                })
                // Rethrow errors
                .catch(err => Promise.reject(err))
        })
}

function updateUserDetailField(userInfo) {
    console.log(userInfo);
    // Update user info in html based on userInfo param
    Object.entries(userInfo).forEach(([key, value]) => {
        if (value !== null && value) {
            if (key === 'avatar_url') {
                document.getElementById('img').src = value;
            } else {
                const element = document.getElementById(key);
                if (key === 'blog') {
                    element.firstElementChild.href = value;
                    element.firstElementChild.innerHTML = value;
                } else {
                    element.innerHTML = value;
                }

                if (key !== 'bio') {
                    element.parentElement.style.display = 'block';
                }
            }
        }
    })
}

function showNotification(type, msg, time = 5000) {
    // Get html elements
    let toastElement = document.getElementById('toast');
    let success = document.getElementById('success-toast');
    let error = document.getElementById('error-toast');
    let toastType = document.getElementById('toast-type');

    // Add success toast css classes and hide error toast css classes
    if (type === 'SUCCESS') {
        toastType.innerHTML = "Success";
        toastElement.classList.add("toast-green");
        toastElement.classList.remove("toast-red");
        success.classList.remove('display-none');
        error.classList.add('display-none');
    }
    // Add error toast css classes and hide success toast css classes
    else {
        toastType.innerHTML = "Error";
        toastElement.classList.remove("toast-green");
        toastElement.classList.add("toast-red");
        success.classList.add('display-none');
        error.classList.remove('display-none');
    }
    // Show toast
    toastElement.classList.remove('display-none');
    document.getElementById('toast-msg').innerHTML = msg;
    // Remove toast after few seconds
    setTimeout(() => toastElement.classList.add('display-none'), time)
}

function hideNotification() {
    document.getElementById('toast').classList.add('display-none');
}

function loadingMode() {
    document.getElementById('submit-input').disabled = true;
    document.getElementById('submit-input').style.cursor = 'wait';
}

function endLoadingMode() {
    document.getElementById('submit-input').disabled = false;
    document.getElementById('submit-input').style.cursor = 'pointer';
}
