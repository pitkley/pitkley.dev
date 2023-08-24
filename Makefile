.PHONY: all

all: zola_build

npm_ci:
	npm ci

vendor_htmx_js: npm_ci
	cp node_modules/htmx.org/dist/htmx.min.js static/htmx.min.js

vendor_fontawesome_css: npm_ci
	cp node_modules/@fortawesome/fontawesome-free/css/all.min.css static/fontawesome.min.css

build_fontawesome_font_subset: npm_ci
	npm run build-fontawesome-font-subset

prerequisites: vendor_htmx_js vendor_fontawesome_css build_fontawesome_font_subset

zola_build: prerequisites
ifdef CF_PAGES_BRANCH
ifeq ($(CF_PAGES_BRANCH), main)
	UMAMI_WEBSITE_ID="28d21032-29bc-40df-b259-ad8dbde4af8d" zola build
else
	UMAMI_WEBSITE_ID="edbff9e2-8886-4786-b6ca-496bef2b5c37" zola build --base-url "$(CF_PAGES_URL)"
endif
else
	UMAMI_WEBSITE_ID="fffaec0e-044e-4f68-840f-b39fff2af546" zola build
endif

serve: prerequisites
	zola serve
serve_drafts: prerequisites
	zola serve --drafts
