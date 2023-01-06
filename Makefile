dir_guard=@mkdir -p $(@D)

define copy
$(dir_guard)
cp $< $@
endef

#TODO: can this somehow call into the CPP makefile?

.PHONY: clean

clean:
	# other stuff is built with the CPP makefile
	rm -rf dist build/deno.lib.d.ts

dist: dist/web dist/deno dist/dictionaries

dist/web: dist/web/hunalign.js dist/web/hunalign.d.ts dist/web/hunalign.wasm

dist/deno: dist/deno/hunalign.js dist/deno/hunalign.d.ts dist/deno/hunalign.wasm

dist/dictionaries:
	mkdir -p $@
	deno run --allow-net --allow-write=./ scripts/createdictionary.ts

build/deno.lib.d.ts:
	$(dir_guard)
	deno types > build/deno.lib.d.ts

# there are more deps but meh. Maybe just force this?
dist/deno/hunalign.js: deno/hunalign.ts
	$(dir_guard)
	deno task bundle

dist/deno/hunalign.d.ts: deno/hunalign.ts build/deno.lib.d.ts
	$(dir_guard)
	#TODO: this will error until a tsc version with this is released: https://github.com/microsoft/TypeScript/pull/51669
	# typescript 5.0.0 should support this: https://github.com/microsoft/TypeScript/issues/51362
	-tsc $< build/deno.lib.d.ts --skipLibCheck --target esnext --declaration --emitDeclarationOnly --outDir $(@D)
	# this is truly hideous, but hopefully typescript 5.0.0 will be our savior
	deno run --allow-read=./ --allow-write=$@ scripts/bundle-deno-type-declarations.ts

dist/deno/hunalign.wasm: build/hunalign.wasm
	$(copy)

dist/web/hunalign.js: ts/hunalign.ts
	$(dir_guard)
	# we set platform to node to avoid explosion on import("module")
	# a better approach might be to somehow ensure ENVIRONMENT_IS_NODE is always false
	esbuild $< --platform=node --format=esm --bundle --minify > $@

dist/web/hunalign.d.ts: ts/hunalign.ts
	$(dir_guard)
	tsc $< --target esnext --declaration --emitDeclarationOnly --outDir $(@D)

dist/web/hunalign.wasm: build/hunalign.wasm
	$(copy)

web/browser.test.js: web/browser.test.ts
	tsc $< --target esnext --module esnext
