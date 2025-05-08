import {Optimize, type Target, VALID_TARGETS} from "./lib.ts";

/** These fields are required on "bun-ffi-z" in package.json */
export type Config = {
  name: string;
  targets: Target[];
  optimize?: Optimize;
  zigCwd: string;
};

export interface Json {
  [key: string]: string | number | boolean | null | Json | Json[];
}

export async function getConfigFromPkgJson(pkgJson: Json): Promise<Config> {
  const config = pkgJson["bun-ffi-z"];
  if (!config) {
    throw new Error("bun-ffi-z config not found in package.json");
  }
  return parseConfig(config as Json);
}

export function parseConfig(input: Json): Config {
  if (input == null || typeof input !== "object") {
    throw new Error("Invalid config: expected an object");
  }

  const name = (input as Record<string, string>).name;
  const targets = (input as Record<string, Json>).targets;
  const optimize = (input as Record<string, string>).optimize as Optimize;
  const zigCwd = (input as Record<string, string>).zigCwd;

  if (typeof name !== "string") {
    throw new Error("Invalid config: expected string \"name\"");
  }

  if (!Array.isArray(targets)) {
    throw new Error("Invalid config: expected array \"targets\"");
  }

  if (targets.length === 0) {
    throw new Error("Invalid config: expected non-empty array \"targets\"");
  }

  for (let i = 0; i < targets.length; i++) {
    if (typeof targets[i] !== "string") {
      throw new Error(`Invalid config: expected string \"targets[${i}]\"`);
    }
    if (!VALID_TARGETS.includes(targets[i] as Target)) {
      throw new Error(`Invalid config: unknown target "${targets[i]}"`);
    }
  }
  if (targets.length !== new Set(targets).size) {
    throw new Error("Invalid config: expected unique \"targets\"");
  }

  if (optimize != null && typeof optimize !== "string") {
    throw new Error("Invalid config: expected string \"optimize\"");
  }
  if (!Object.values(Optimize).includes(optimize as Optimize)) {
    throw new Error(`Invalid config: unknown optimize "${optimize}"`);
  }
  if (zigCwd != null && typeof zigCwd !== "string") {
    throw new Error("Invalid config: expected string \"zigCwd\"");
  }

  return { name, targets, optimize, zigCwd: zigCwd ?? "." };
}
