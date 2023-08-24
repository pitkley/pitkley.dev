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
	zola build
else
	zola build --base-url "$(CF_PAGES_URL)"
endif
else
	zola build
endif

serve: prerequisites
	zola serve
serve_drafts: prerequisites
	zola serve --drafts
