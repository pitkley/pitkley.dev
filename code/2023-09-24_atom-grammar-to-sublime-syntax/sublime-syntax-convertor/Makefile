export PATH := $(HOME)/.bun/bin:$(PATH)

.PHONY: build

build: check-env
	bun install
	bun build --target=browser ./index.ts --outdir=out
	@mkdir -p "${ROOT_DIR}/static/atom-grammar-to-sublime-syntax/"
	cp out/index.js "${ROOT_DIR}/static/atom-grammar-to-sublime-syntax/sublimeSyntaxConvertor.js"

check-env:
ifndef ROOT_DIR
	$(error ROOT_DIR is undefined)
endif
ifeq (, $(shell which bun))
ifdef CF_PAGES_BRANCH # We are building in Cloudflare so we install bun
	curl -fsSL https://bun.sh/install | bash
else ifdef CI # We are building in GitHub Actions so we install bun
	curl -fsSL https://bun.sh/install | bash
else
	$(error "No bun in $(PATH)")
endif
endif
