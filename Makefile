.PHONY: help sync
.SILENT: deploy
.DEFAULT_GOAL := help

BUCKET_NAME   := migueli.to-web
BUCKET_PREFIX := /dist

help:  ## Show this help
	@grep -E '^[a-zA-Z0-9_ -]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build:   ## Make the bundle
	npm run build

deploy:  ## Upload static assets to S3
	./scripts/deploy.sh $(BUCKET_NAME) $(BUCKET_PREFIX)
