import {join} from 'node:path';
import {type Library, type FFIFunction, dlopen} from 'bun:ffi';
import { getConfigFromPkgJson } from './config';

if (typeof Bun === "undefined") {
  throw new Error("This script must be run with Bun.");
}

/**
 * Bun only supports these targets
 *
 * See https://bun.sh/docs/bundler/executables#supported-targets
 */
export const VALID_TARGETS = [
  "linux-x64-gnu",
  "linux-x64-musl",
  "linux-arm64-gnu",
  "linux-arm64-musl",
  "darwin-x64",
  "darwin-arm64",
  "win32-x64-msvc",
] as const;

export type Target = typeof VALID_TARGETS[number];

export async function getTarget(platform: NodeJS.Platform, arch: NodeJS.Architecture): Promise<Target> {
  switch (platform) {
    case 'linux': {
      const musl = await isMusl();
      switch (arch) {
        case 'x64':
          return musl ? 'linux-x64-musl' : 'linux-x64-gnu';
        case 'arm64':
          return musl ? 'linux-arm64-musl' : 'linux-arm64-gnu';
      }
      break;
    }
    case 'darwin':
      switch (arch) {
        case 'x64':
          return 'darwin-x64';
        case 'arm64':
          return 'darwin-arm64';
      }
      break;
    case 'win32':
      return 'win32-x64-msvc';
  }
  throw new Error(`Unsupported platform: ${platform} ${arch}`);
}

export function getTargetParts(target: Target): {platform: NodeJS.Platform, arch: NodeJS.Architecture, abi?: string} {
  const [platform, arch, abi] = target.split('-') as [NodeJS.Platform, NodeJS.Architecture, string?];
  return {platform, arch, abi};
}

export enum Optimize {
  Debug = "Debug",
  ReleaseSmall = "ReleaseSmall",
  ReleaseFast = "ReleaseFast",
  ReleaseSafe = "ReleaseSafe",
};
export function getZigTriple(target: Target): string {
  switch (target) {
    case 'linux-x64-gnu':
      return 'x86_64-linux-gnu';
    case 'linux-x64-musl':
      return 'x86_64-linux-musl';
    case 'linux-arm64-gnu':
      return 'aarch64-linux-gnu';
    case 'linux-arm64-musl':
      return 'aarch64-linux-musl';
    case 'darwin-x64':
      return 'x86_64-macos';
    case 'darwin-arm64':
      return 'aarch64-macos';
    case 'win32-x64-msvc':
      return 'x86_64-windows-msvc';
  }
}

export function getLibraryPrefix(platform: NodeJS.Platform): string {
  switch (platform) {
    case 'win32':
      return '';
    default:
      return 'lib';
  }
}

export function getLibrarySuffix(platform: NodeJS.Platform): string {
  switch (platform) {
    case 'darwin':
      return '.dylib';
    case 'win32':
      return '.dll';
    default:
      return '.so';
  }
}

export function getLibraryName(name: string, platform: NodeJS.Platform): string {
  const prefix = getLibraryPrefix(platform);
  const suffix = getLibrarySuffix(platform);

  return `${prefix}${name}${suffix}`;
}

export function getLocalLibraryPath(cwd: string, name: string, platform: NodeJS.Platform): string {
  const libraryName = getLibraryName(name, platform);
  return join(cwd, 'zig-out', 'lib', libraryName);
}

// cache the result of isMusl() to avoid calling it multiple times across different ffi modules
let isMuslCache: boolean | undefined;
export async function isMusl(): Promise<boolean> {
  if (isMuslCache !== undefined) {
    return isMuslCache;
  }
  try {
    isMuslCache = (await Bun.file('/usr/bin/ldd').text()).includes('musl');
    return isMuslCache as boolean;
  } catch {
    // biome-ignore lint/suspicious/noExplicitAny: report is loosely typed
    isMuslCache = (process.report.getReport() as any).header?.glibcVersionRuntime == null;
    return isMuslCache as boolean;
  }
}

/**
 * Get zig dynamic library paths
 * - on local development, it will be in `zig-out/lib` of the zigCwd
 * - on published package, it will be in `node_modules/${packageName}/lib${name}.*`
 */
export async function getLibraryPaths(
  zigCwd: string,
  packageName: string,
  name: string,
  platform: NodeJS.Platform,
  arch: NodeJS.Architecture,
): Promise<string[]> {
  const paths: string[] = [];
  const libraryName = getLibraryName(name, platform);
  // local development
  const localPath = join(zigCwd, 'zig-out', 'lib', libraryName);
  if (await Bun.file(localPath).exists()) {
    paths.push(localPath);
  }

  try {
    // published package
    const packageTarget = await getTarget(platform, arch);
    const fullPackageName = `${packageName}-${packageTarget}`;
    const publishedPath = join(import.meta.resolve(fullPackageName), libraryName);
    if (await Bun.file(publishedPath).exists()) {
      paths.push(publishedPath);
    }
  } catch {
    // on local env, this will fall without a published package on native platform
  }

  return paths;
}

/**
 * This function searches all feasible library paths and attempts to load the library.
 * Depending on the platform and architecture, and whether the library has been built locally or published, the library may be in different locations.
 * First, it checks the local build path, then it checks published paths.
 *
 * Eg:
 * - built locally, on Linux, `zig-out/lib/libexample.so`
 * - built locally, on Windows, `zig-out/lib/example.dll`
 * - published, on Linux, `node_modules/${package_name}/libexample.so`
 * - published, on WIndows,  `node_modules/${package_name}/example.dll`
 */
export async function openLibrary<Fns extends Record<string, FFIFunction>>(
  bunCwd: string,
  abi: Fns,
): Promise<Library<Fns>> {
  const pkgJson = await Bun.file(join(bunCwd, 'package.json')).json();
  const packageName = pkgJson.name;
  const platform = process.platform;
  const arch = process.arch;
  const config = await getConfigFromPkgJson(pkgJson);
  const name = config.name;

  const zigCwd = join(bunCwd, config.zigCwd);
  const libraryPaths = await getLibraryPaths(zigCwd, packageName, name, platform, arch);

  for (const libraryPath of libraryPaths) {
    if (!(await Bun.file(libraryPath).exists())) {
      continue;
    }
    try {
      return dlopen(libraryPath, abi);
    } catch {
      console.warn(`Failed to load library ${libraryPath}`);
    }
  }
  throw new Error(`Failed to load library ${name} for ${platform}-${arch}`);
}