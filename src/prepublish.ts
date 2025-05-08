import {join} from "node:path";
import {getLibraryName, type Target, getTargetParts} from "./lib.ts";
import { getConfigFromPkgJson, type Config, type Json } from "./config.ts";
import { build } from "./build.ts";

export async function writeTargetPackage(
  rootPkgJson: Json,
  config: Config,
  target: Target,
): Promise<void> {

  const {platform, arch, abi} = getTargetParts(target);
  const libraryName = getLibraryName(config.name, platform);

  const libc = platform !== 'linux' ?
    undefined :
    abi === 'gnu' ? 'glibc' :
    abi === 'musl' ? 'musl' :
    undefined;

  // Create the target package.json based on the root package.json
  const targetPkgJson = {
    name: `${rootPkgJson.name}-${target}`,
    version: rootPkgJson.version,
    license: rootPkgJson.license,
    repository: rootPkgJson.repository,
    main: libraryName,
    files: [libraryName],
    engines: rootPkgJson.engines ?? {
      bun: "*"
    },
    os: [platform],
    cpu: [arch],
    ...(libc ? { libc: [libc] } : {}),
  };

  // Write the target package metadata
  // Currently, this is package.json and README.md

  await Bun.write(
    join(process.cwd(), 'targetPackages', target, 'package.json'),
    JSON.stringify(targetPkgJson, null, 2),
  );

  await Bun.write(
    join(process.cwd(), 'targetPackages', target, 'README.md'),
    ` # \`${targetPkgJson.name}\`

This is the ${target} target package for ${rootPkgJson.name}.

`);
}

export async function copyTargetLibrary(
  config: Config,
  target: Target,
): Promise<void> {
  const {platform} = getTargetParts(target);
  const libraryName = getLibraryName(config.name, platform);
  const zigCwd = config.zigCwd;

  const zigOutDir = join(zigCwd, "zig-out", "bin");
  const targetDir = join(process.cwd(), 'targetPackages', target);

  await Bun.write(
    join(targetDir, libraryName),
    await Bun.file(join(zigOutDir, libraryName)).arrayBuffer(),
  );
}

export async function updateOptionalDependencies(
  pkgJson: Json,
  config: Config,
): Promise<Json> {
  const optionalDependencies = (pkgJson.optionalDependencies ?? {}) as Record<string, string>;
  for (const target of config.targets) {
    optionalDependencies[`${pkgJson.name}-${target}`] = pkgJson.version as string;
  }
  pkgJson.optionalDependencies = optionalDependencies;
  return pkgJson;
}

export async function prepublish(): Promise<void> {
  const pkgJson = await Bun.file(join(process.cwd(), "package.json")).json() as Json;
  const config = await getConfigFromPkgJson(pkgJson);
  for (const target of config.targets) {
    await writeTargetPackage(pkgJson, config, target);
    await build({
      target,
      optimize: config.optimize,
      zigCwd: config.zigCwd,
    });
    await copyTargetLibrary(config, target);
  }
  const updatedPkgJson = await updateOptionalDependencies(pkgJson, config);
  await Bun.write(
    join(process.cwd(), "package.json"),
    JSON.stringify(updatedPkgJson, null, 2),
  );
}
