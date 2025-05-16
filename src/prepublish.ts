import {join} from "node:path";
import {existsSync} from "node:fs";
import {parseArgs, type ParseArgsOptionsConfig} from "node:util";
import {getLibraryName, type Target, getTargetParts, getZigTriple} from "./lib.ts";
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
  sourceDir: string,
  destDir: string,
  libraryName: string,
): Promise<void> {
  await Bun.write(
    join(destDir, libraryName),
    await Bun.file(join(sourceDir, libraryName)).arrayBuffer(),
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

/**
 * Ensure all target packages are ready to be published. This means that each target will get a subdirectory with a package.json, README.md, and its target library.
 * 
 * The `artifactsDir` option is the directory, if specified, which will be used to find prebuilt target libraries.
 * Each prebuilt library is expected to be in a subdirectory named by its target.
 * 
 * If either `artifactsDir` is not specified or the directory does not exist, all targets will be rebuilt.
 * 
 * If any prebuilt target library is not found, the target will be rebuilt.
 */
export async function prepublish({artifactsDir}: {artifactsDir?: string}): Promise<void> {
  const bunCwd = process.cwd();
  const rootPkgJsonPath = join(bunCwd, "package.json");
  const pkgJson = await Bun.file(rootPkgJsonPath).json() as Json;
  const config = await getConfigFromPkgJson(pkgJson);

  let artifactsDirPath: string | undefined;
  if (artifactsDir == null) {
    console.warn("No artifacts directory specified, rebuilding all targets");
  } else {
    artifactsDirPath = join(bunCwd, artifactsDir);
    if (!existsSync(artifactsDirPath)) {
      console.warn(`Artifacts directory "${artifactsDirPath}" does not exist, rebuilding all targets`);
      artifactsDirPath = undefined;
    }
  }


  for (const target of config.targets) {
    const destDir = join(process.cwd(), 'targetPackages', target);
    let sourceDir: string | undefined;
    const {platform} = getTargetParts(target);
    const libraryName = getLibraryName(config.name, platform);
    if (artifactsDirPath) {
      sourceDir = join(artifactsDirPath, target);
      if (!existsSync(join(sourceDir, libraryName))) {
        console.warn(`Artifact for target "${target}" not found in "${sourceDir}", rebuilding`);
        sourceDir = undefined;
      }
    }

    if (sourceDir == null) {
      sourceDir = join(config.zigCwd, 'zig-out', 'lib');
      await build({
        target,
        optimize: config.optimize,
        zigCwd: config.zigCwd,
      });
    }

    await writeTargetPackage(pkgJson, config, target);
    await copyTargetLibrary(sourceDir, destDir, libraryName);
  }
  const updatedPkgJson = await updateOptionalDependencies(pkgJson, config);
  await Bun.write(
    rootPkgJsonPath,
    JSON.stringify(updatedPkgJson, null, 2),
  );
}

const prepublishOptions = {
  artifacts: {
    type: "string",
  },
} satisfies ParseArgsOptionsConfig;

/**
 * Ensure all target packages are ready to be published. This means that each target will get a subdirectory with a package.json, README.md, and its target library.
 * 
 * The `--artifacts` option is the directory, if specified, which will be used to find prebuilt target libraries.
 * Each prebuilt library is expected to be in a subdirectory named by its target.
 * 
 * If either the `--artifacts` option is not specified or the directory does not exist, all targets will be rebuilt.
 * 
 * If any prebuilt target library is not found, the target will be rebuilt.
 */
export async function prepublishCli(): Promise<void> {
  const {values} = parseArgs({
    options: prepublishOptions,
    allowPositionals: true,
  });

  await prepublish({
    artifactsDir: values.artifacts,
  });
}
