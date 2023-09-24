.PHONY: build

build: check-env
	npm ci
	@mkdir -p "${ROOT_DIR}/static/atom-grammar-to-sublime-syntax/"
	npm run build -- -o "${ROOT_DIR}/static/atom-grammar-to-sublime-syntax/cson.js"

check-env:
ifndef ROOT_DIR
	$(error ROOT_DIR is undefined)
endif
