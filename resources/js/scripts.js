import {getUserDetails, getUserFavoriteLanguage} from "./github-apis.js";

const REQUIRED_FIELDS = ['avatar_url', 'name', 'company', 'blog', 'location', 'email', 'bio']

document.forms['user-input'].addEventListener('submit', fetchUserData);
document.getElementById('toast-close').addEventListener('click', hideNotification);

function fetchUserData(e) {
    e.preventDefault();
    hideNotification();
    const username = new FormData(e.target).get('github_username').toString();

    loadingMode();
    getCompleteUserInfo(username)
        .then(userInfo => {
            updateUserDetailField(userInfo);
            return userInfo;
        })
        .then(userInfo => localStorage.setItem(username, JSON.stringify(userInfo)))
        .then(() => showNotification('SUCCESS', 'Userinfo fetched successfully.'))
        .catch(err => {
            console.error(err);
            if (err.toString() === 'HttpError: Not Found')
                showNotification("ERROR", `There is no such user with username ${username}`);
            else
                showNotification("ERROR", err.toString());
        })
        .then(endLoadingMode);
}

async function getCompleteUserInfo(username) {
    if (localStorage[username])
        return Promise.resolve(JSON.parse(localStorage[username]));

    return getUserDetails(username)
        .then(response => JSON.stringify(response, REQUIRED_FIELDS))
        .then(details => {
            return getUserFavoriteLanguage(username)
                .then(response => {
                    const user_info = JSON.parse(details);
                    user_info['fav_lang'] = response;
                    return user_info;
                })
                .catch(err => Promise.reject(err))
        })
}

function updateUserDetailField(userInfo) {
    console.log(userInfo)
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
    let toastElement = document.getElementById('toast');
    let success = document.getElementById('success-toast');
    let error = document.getElementById('error-toast');
    let toastType = document.getElementById('toast-type');
    if (type === 'SUCCESS') {
        toastType.innerHTML = "Success";
        toastElement.classList.add("toast-green");
        toastElement.classList.remove("toast-red");
        success.classList.remove('display-none');
        error.classList.add('display-none');
    } else {
        toastType.innerHTML = "Error";
        toastElement.classList.remove("toast-green");
        toastElement.classList.add("toast-red");
        success.classList.add('display-none');
        error.classList.remove('display-none');
    }
    toastElement.classList.remove('display-none');
    document.getElementById('toast-msg').innerHTML = msg;
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
