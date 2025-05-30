import { parseArgs } from "node:util";
import { buildCli } from "./build.ts";
import { prepublishCli } from "./prepublish.ts";
import { publish } from "./publish.ts";
import { generateBinding } from "./generateBinding.ts";

export async function cli(): Promise<void> {
  const {positionals} = parseArgs({
    allowPositionals: true,
    strict: false,
  });

  const cmd = positionals[0];

  switch (cmd) {
    case "generate-binding":
      return await generateBinding();
    case "build":
      return await buildCli();
    case "prepublish":
      return await prepublishCli();
    case "publish":
      return await publish();
    default:
      throw new Error(`Unknown command "${cmd}"`);
  }
}

await cli();