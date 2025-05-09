import {parseArgs, type ParseArgsOptionsConfig} from "node:util";
import {getTarget, getZigTriple, Optimize, type Target, VALID_TARGETS} from "./lib.ts";

export type BuildOptions = {
  target: Target;
  optimize?: Optimize;
  zigCwd: string;
};

export async function build(opts: BuildOptions): Promise<void> {
  const cmd = ["zig", "build"]

  const triple = getZigTriple(opts.target);
  cmd.push(`-Dtarget=${triple}`);

  if (opts.optimize) {
    cmd.push(`-Doptimize=${opts.optimize}`);
  }

  Bun.spawnSync({
    cwd: opts.zigCwd,
    cmd: cmd,
  });
}

const buildCliOptions = {
  "optimize": {
    type: "string",
  },
  "zig-cwd": {
    type: "string",
    default: ".",
  },
  "target": {
    type: "string",
  },
} satisfies ParseArgsOptionsConfig;


export async function buildCli(): Promise<void> {
  const {values} = parseArgs({
    options: buildCliOptions,
    allowPositionals: true,
  });

  const target = values.target as Target | undefined ?? await getTarget(process.platform, process.arch);
  if (VALID_TARGETS.includes(target) === false) {
    throw new Error(`Invalid target "${target}"`);
  }

  const optimize = values.optimize as Optimize | undefined;
  if (optimize != null && Object.values(Optimize).includes(optimize) === false) {
    throw new Error(`Invalid optimize "${optimize}"`);
  }

  const buildOptions: BuildOptions = {
    target,
    optimize,
    zigCwd: values["zig-cwd"],
  };

  await build(buildOptions);
}
