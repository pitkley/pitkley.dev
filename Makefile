MAKEFILE_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR := $(patsubst %/,%,$(dir $(MAKEFILE_PATH)))

NESTED_MAKEFILES = $(shell find code/ -type f -name Makefile -a \! -path '*/node_modules/*')

.PHONY: all
all: build

npm_ci:
	npm ci

vendor_htmx_js: npm_ci
	cp node_modules/htmx.org/dist/htmx.min.js static/htmx.min.js

vendor_fontawesome_css: npm_ci
	cp node_modules/@fortawesome/fontawesome-free/css/all.min.css static/fontawesome.min.css

build_fontawesome_font_subset: npm_ci
	npm run build-fontawesome-font-subset

build_nested_makefiles:
	@for makefile in $(NESTED_MAKEFILES); do \
		echo "running nested make in $$(dirname $$makefile)"; \
		ROOT_DIR="${ROOT_DIR}" $(MAKE) -C $$(dirname $$makefile); \
	done

prerequisites: vendor_htmx_js vendor_fontawesome_css build_fontawesome_font_subset build_nested_makefiles

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

purge_css: zola_build
	node_modules/.bin/purgecss --css static/fontawesome.min.css --content public/**/*.html --output public/

build: zola_build purge_css

serve: prerequisites
	zola serve
serve_drafts: prerequisites
	zola serve --drafts
