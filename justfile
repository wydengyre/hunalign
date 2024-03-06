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

test: build
    just test-pack
    npm run typecheck-test
    npm run test
    just test-cleanup

test-pack: build
    #!/usr/bin/env bash
    TARBALL_NAME=$(npm pack | tail -n1)
    cd ts/test && npm install ../../"$TARBALL_NAME"

test-cleanup:
    cd ts/test && npm uninstall '@bitextual/hunalign'
    rm *.tgz
