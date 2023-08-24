import { fontawesomeSubset } from "fontawesome-subset";

const subset = {
    "regular": ["envelope"],
    "solid": ["rss", "star", "code-branch"],
    "brands": ["twitter", "github", "linkedin"],
};

fontawesomeSubset(
    subset,
    "static/webfonts/",
)
