import {Octokit} from "https://cdn.skypack.dev/octokit?dts";

const octokit = new Octokit({auth: `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`});

export async function getUserDetails(username) {
    return await octokit.request('GET /users/{username}', {
        username: username
    }).then(response => {
        return Promise.resolve(response.data);
    }).catch(err => {
        return Promise.reject(err);
    });
}

export async function getUserFavoriteLanguage(username) {
    return await octokit.request('GET /users/{username}/repos', {
        username: username
    })
        .then(response => {
            return Promise.resolve(response.data.sort((a, b) => {
                return Date.parse(b['pushed_at']).valueOf() - Date.parse(a['pushed_at']).valueOf()
            }).slice(0, 5));
        })
        .catch(Promise.reject)
        .then(repositories => {
            return Promise.all(repositories.map(repo => octokit.request(`GET ${repo['languages_url']}`).then(value => value.data)))
        })
        .catch(Promise.reject)
        .then(languages => {
            let maxKey, maxValue = 0;
            languages.forEach(lang => {
                Object.entries(lang).forEach(([key, value]) => {
                    if (value > maxValue) {
                        maxKey = key;
                        maxValue = value;
                    }
                });
            });
            return Promise.resolve(maxKey);
        })
}
