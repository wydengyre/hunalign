#!/usr/bin/env just --justfile

default:
	just --list --justfile {{justfile()}}

clean:
    npm run clean

ci: ci-lint typecheck build test

ci-lint:
	npm run ci-lint

lint:
	npm run lint

build:
    cd src/hunalign && make
    npm run build

typecheck:
    npm run typecheck

test:
    npm run test