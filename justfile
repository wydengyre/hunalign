#!/usr/bin/env just --justfile

default:
	just --list --justfile {{justfile()}}

clean:
    rm -rf build
    npm run clean

ci: ci-lint build test

ci-lint:
	npm run ci-lint

lint:
	npm run lint

build:
    cd src/hunalign && make
    npm run build

test:
    npm run typecheck-test
    npm run test