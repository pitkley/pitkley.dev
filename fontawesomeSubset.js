import { fontawesomeSubset } from "fontawesome-subset";

const subset = {
    "regular": [
        "comment",
        "envelope",
    ],
    "solid": [
        "code-branch",
        "rss",
        "star",
    ],
    "brands": [
        "github",
        "linkedin",
        "markdown",
        "twitter",
    ],
};

fontawesomeSubset(
    subset,
    "static/webfonts/",
)
