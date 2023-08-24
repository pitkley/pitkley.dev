async function githubFactsResponse(kv, repository) {
    const cachedHtmlFragment = await kv.get(repository);
    if (cachedHtmlFragment) {
        return new Response(cachedHtmlFragment);
    }

    const response = await fetch(
        new URL(repository, "https://api.github.com/repos/"),
        {
            "headers": {
                "User-Agent": "Cloudflare Worker, https://pitkley.dev",
            },
        },
    );
    const json = await response.json();

    const stargazerFragment = `
        <span class="icon is-large">
            <i class="fa fas fa-star"></i>
        </span>
        ${json["stargazers_count"]}
    `;

    let forksFragment = "";
    if (json["forks_count"] > 0) {
        forksFragment = `
            <span class="icon is-large">
                <i class="fa fas fa-code-branch"></i>
            </span>
            ${json["forks_count"]}
        `;
    }

    const htmlFragment = `
        <div class="article-github">
            <a href="https://www.github.com/${repository}">
                ${stargazerFragment}
                ${forksFragment}
            </a>
        </div>
    `;
    await kv.put(repository, htmlFragment, {expirationTtl: 60 * 60 * 24});
    return new Response(htmlFragment);
}

const REPOSITORY_WHITELIST = [
    "pitkley/aws-search-extension",
    "pitkley/cfzt",
    "pitkley/dfw",
    "pitkley/i3nator",
    "pitkley/impaired",
    "pitkley/in-container",
    "pitkley/pitkley.dev",
];

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const repository = url.searchParams.get("repository");
    if (!repository) {
        return new Response(null, {status: 400});
    }
    if (!REPOSITORY_WHITELIST.includes(repository)) {
        return new Response(null, {status: 403});
    }

    return await githubFactsResponse(context.env.KV, repository);
}
