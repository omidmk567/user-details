import {getUserDetails, getUserFavoriteLanguage} from "./github-apis.js";

const requiredFields = ['avatar_url', 'name', 'company', 'blog', 'location', 'email', 'bio']

document.forms['user-input'].addEventListener('submit', fetchUserData)

function fetchUserData(e) {
    e.preventDefault();
    clearNotification();
    const username = new FormData(e.target).get('github_username').toString();
    if (localStorage[username]) {
        updateUserDetailField(localStorage[username]);
    } else {
        updateNotification('loading...');
        getCompleteUserInfo(username)
            .then(userInfo => {
                clearNotification();
                return userInfo;
            })
            .then(JSON.stringify)
            .then(userInfo => {
                updateUserDetailField(userInfo);
                return userInfo;
            })
            .then(userInfo => {
                localStorage.setItem(username, userInfo);
                return userInfo;
            })
            .catch(err => {
                if (err.toString() === 'HttpError: Not Found') {
                    console.log('not found at all!');
                    updateUserDetailField('username not found!');
                } else {
                    updateNotification(err);
                    updateUserDetailField('error occured!');
                }
                return err;
            });
    }
}

function getCompleteUserInfo(username) {
    return getUserDetails(username)
        .then(response => JSON.stringify(response, requiredFields))
        .then(details => {
            return getUserFavoriteLanguage(username)
                .then(response => {
                    const user_info = JSON.parse(details);
                    user_info['fav_lang'] = response;
                    return user_info;
                })
                .catch(err => new Error(err))
        })
}

function updateUserDetailField(details) {
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