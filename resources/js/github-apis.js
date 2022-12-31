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