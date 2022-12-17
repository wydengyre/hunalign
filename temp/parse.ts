import {xml2js, Xml2JsOptions} from "xml2js";
import { z } from "zod";


const str = Deno.readTextFileSync("./apertium-eng-spa.spa.dix");
const parseOpts: Xml2JsOptions = { compact: true };
const parsed = xml2js(str, parseOpts);

console.log(parsed);

const apertiumSchema = z.object({
  dictionary: z.object({
    section: z.array(z.object({
      e: z.object({
        p: z.object({
          // the objects that end up here are confusing.
          l: z.string().or(z.object({})).nullable(),
          r: z.string().or(z.object({})).nullable(),
        }).or(z.array(z.unknown())).optional(),
        // looks like instead of p there can be i
      }).array(),
    })),
  }),
});
const zodded = apertiumSchema.parse(parsed);
console.log(zodded);
