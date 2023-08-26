+++
title = "Cloudflare Pages: outdated content/styles"

[taxonomies]
tags = [
    "cloudflare",
]
+++

If you are experiencing outdated content or outdated styling, the cause might be the use of a custom domain with Cloudflare Pages.
While a deployment in Cloudflare Pages automatically purges caches on `pages.dev`, and apparently also on custom domains if there are no page rules or cache settings configured,[^1] I have had it happen that styles were still outdated.

As [documented by Cloudflare][cloudflare-pages-caching], manually purging the caches might be necessary.
Go to the [Cloudflare dashboard](https://dash.cloudflare.com/), select your domain, go to "Caching", "Configuration" and then click on "Purge Everything".
After a final confirmation, you should see your updated content.

[^1]: Source: [Serving Pages · Cloudflare Pages docs][cloudflare-pages-caching].

[cloudflare-pages-caching]: https://developers.cloudflare.com/pages/platform/serving-pages/#caching-and-performance
