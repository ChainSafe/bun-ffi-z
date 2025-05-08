import { parseArgs } from "node:util";
import { buildCli } from "./build.ts";
import { prepublish } from "./prepublish.ts";
import { publish } from "./publish.ts";

export async function cli(): Promise<void> {
  const {positionals} = parseArgs({
    allowPositionals: true,
    strict: false,
  });

  const cmd = positionals[0];

  switch (cmd) {
    case "build":
      return await buildCli();
    case "prepublish":
      return await prepublish();
    case "publish":
      return await publish();
    default:
      throw new Error(`Unknown command "${cmd}"`);
  }
}

await cli();