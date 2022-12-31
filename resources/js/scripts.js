import {getUserDetails} from "./github-apis.js";

document.forms['user-input'].addEventListener('submit', fetchUserData)

function fetchUserData(e) {
    e.preventDefault();
    clearNotification();
    const username = new FormData(e.target).get('github_username');
    if (localStorage[username]) {
        updateFields(localStorage[username])
    } else {
        updateNotification('loading');
        getUserDetails(username)
            .then(JSON.stringify)
            .then(details => {
                updateFields(details)
                return details;
            })
            .then(details => {
                clearNotification();
                return details;
            })
            .catch(err => {
                updateNotification(err);
                updateFields('');
                return err;
            })
            .then(details => {
                localStorage.setItem(username, details)
            })
    }
}

function updateFields(details) {
    document.getElementById('user-details').innerHTML = details;
}

function updateNotification(msg) {
    const notification = document.getElementById('notification');
    notification.innerHTML = msg;
    notification.style.display = 'block';
}

function clearNotification() {
    document.getElementById('notification').style.display = 'none';
}