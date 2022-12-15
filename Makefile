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

dist: dist/deno/hunalign.js dist/deno/hunalign.d.ts dist/deno/hunalign.wasm

build/deno.lib.d.ts:
	deno types > build/deno.lib.d.ts

# there are more deps but meh. Maybe just force this?
dist/deno/hunalign.js: deno/hunalign.ts
	deno task bundle

dist/deno/hunalign.d.ts: deno/hunalign.ts build/deno.lib.d.ts
	#TODO: this will error until a tsc version with this is released: https://github.com/microsoft/TypeScript/pull/51669
	-tsc deno/hunalign.ts build/deno.lib.d.ts --skipLibCheck --target esnext --declaration --emitDeclarationOnly --outFile dist/deno/hunalign.d.ts

dist/deno/hunalign.wasm: build/hunalign.wasm
	$(copy)
