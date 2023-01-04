import puppeteer from "puppeteer";

import { serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";
import { deferred } from "std/async/deferred.ts";
import { fromFileUrl } from "std/path/mod.ts";
import { assertStrictEquals } from "std/testing/asserts.ts";

const TEST_PAGE = "test.html";
const LADDER_PATH = fromFileUrl(
  import.meta.resolve("./test/ladder.json"),
);

type HostNameAndPort = { hostname: string; port: number };

// TODO: automate on first run
// error: Uncaught Error: Could not find browser revision 1022525. Run "PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts" to download a supported browser binary.

Deno.test("end to end ladder production in browser", async () => {
  const ladderFileText = await Deno.readTextFile(LADDER_PATH);
  const expectedLadder = JSON.stringify(JSON.parse(ladderFileText));

  const listeningPromise = deferred<HostNameAndPort>();
  const serveAbortController = new AbortController();
  const serveInit = {
    signal: serveAbortController.signal,
    // onError
    onListen: (hnp: HostNameAndPort) => listeningPromise.resolve(hnp),
  };

  console.error("starting server");
  const handler = (req: Request) => serveDir(req);
  const _servePromise = serve(handler, serveInit);

  const { hostname, port } = await listeningPromise;
  console.error(`server started at hostname ${hostname} and port ${port}`);

  console.error("launching");
  const browser = await puppeteer.launch();
  console.error("launched, new page");
  const page = await browser.newPage();
  console.error("opened page, navigating to test page");
  await page.goto(`http://${hostname}:${port}/${TEST_PAGE}`);
  console.error("navigated to test page, waiting to load ladder");

  // TODO: timeout
  const ladderElement = (await page.waitForSelector("#ladder"))!;
  const ladderHtmlText: string = await ladderElement.evaluate((el) =>
    el.textContent
  );
  const normalizedLadderText = JSON.stringify(JSON.parse(ladderHtmlText));
  await browser.close();
  console.error("closed");

  console.error("closing server");
  serveAbortController.abort();

  assertStrictEquals(normalizedLadderText, expectedLadder);
});
