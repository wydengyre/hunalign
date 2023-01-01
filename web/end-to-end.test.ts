import { serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";

await serve((req) => serveDir(req));
