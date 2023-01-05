import {Octokit} from "https://cdn.skypack.dev/octokit?dts";

// Connect to octokit with timout 0 and without retry
const octokit = new Octokit({
    auth: `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`, request: {
        timeout: 0
    }, retry: {
        enabled: false
    }
});

// Get user details from GitHub
export async function getUserDetails(username) {
    if (!username)
        return Promise.reject("Username can't be empty");

    return await octokit.request('GET /users/{username}', {
        username: username
    }).then(response => {
        return Promise.resolve(response.data);
    })
}

// Get favorite language of user from GitHub
export async function getUserFavoriteLanguage(username) {
    return await octokit.request('GET /users/{username}/repos', {
        username: username
    }).then(response => {
        // Sort repositories based on their push time
        return Promise.resolve(response.data.sort((a, b) => {
            return Date.parse(b['pushed_at']).valueOf() - Date.parse(a['pushed_at']).valueOf()
        }).slice(0, 5));
    }).then(repositories => {
        // Call each repository api to find the score of languages in that repository
        return Promise.all(repositories.map(repo => octokit.request(`GET ${repo['languages_url']}`).then(value => value.data)))
    }).then(languages => {
        // Find language with max score
        let maxKey = '', maxValue = 0;
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
