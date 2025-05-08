import { join } from "node:path";
import { getConfigFromPkgJson, type Json } from "./config.ts";

function extraPublishArgs(): string[] {
  const publishIx = process.argv.findIndex((arg) => arg === "publish");
  if (process.argv[publishIx + 1] === "--") {
    return process.argv.slice(publishIx + 2);
  }
  return process.argv.slice(publishIx + 1);
}

export async function publish(): Promise<void> {
  const publishArgv = ["bun", "publish", ...extraPublishArgs()];

  const pkgJson = await Bun.file(join(process.cwd(), "package.json")).json() as Json;
  const config = await getConfigFromPkgJson(pkgJson);
  for (const target of config.targets) {
    Bun.spawnSync({
      cmd: publishArgv,
      cwd: join(process.cwd(), "targetPackages", target),
    });
  }
  Bun.spawnSync({
    cmd: publishArgv,
    cwd: process.cwd(),
  });
}