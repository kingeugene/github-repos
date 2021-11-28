"use strict";

const URL_API_GITHUB = "https://api.github.com"

const input = document.getElementById("input")
const submitBtn = document.getElementById("submit");
const listRepo = document.getElementById("listRepo");
const loader = document.getElementById("loader");

submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    listRepo.innerHTML = "";

    if (!input.value || Loading.isLoading) {
        return;
    }

    Loading.setLoading();

    const userNames = getUserNamesFromString(input.value);

    try {
        const data = await Promise.allSettled(
            userNames.map(userName => fetchRepos(userName))
        );

        renderReposInHtml(
            sortReposByStargazers(
                combineRepos(
                    filterSuccessRepos(data)
                )
            )
        );

    }catch (error) {
        alert("Error Fetch");
        console.log(error);
    }

    Loading.removeLoading();
})

const fetchRepos = async (userName = "") => {
    const response = await fetch(`${URL_API_GITHUB}/users/${userName}/repos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    return await response.json();
}

const renderReposInHtml = (repos = []) => {
    const liElements = [];

    repos.forEach(({ stargazers_count, name }) => {
        const liElement = document.createElement("li");

        liElement.textContent = `${stargazers_count} - ${name}`;
        liElements.push(liElement);
    });

    listRepo.append(...liElements);
}

const getUserNamesFromString = (namesString) => {
    return namesString
        .split(",")
        .map(userName => userName.trim())
        .filter(userName => !!userName);
}

const filterSuccessRepos = (repos) => {
    return repos.filter(({ status, value }) =>
        status === "fulfilled"
        && Array.isArray(value)
    );
}

const sortReposByStargazers = (repos) => {
    return repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
}

const combineRepos = (repos) => {
    return repos.reduce((acc, repo) => {
        return acc.concat(repo.value);
    }, []);
}

class Loading {
    static loading = false;

    static get isLoading() {
        return this.loading;
    }

    static setLoading() {
        loader.classList.remove("d-none");
        this.loading = true;
    }

    static removeLoading() {
        loader.classList.add("d-none");
        this.loading = false;
    }
}
