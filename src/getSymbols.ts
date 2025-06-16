// Unfortunately, Zig's support for emitting header files is currently broken.
// This functionality is a workaround to generate bun ffi function definitions from parsed zig source files

import type { FFIFunction, FFITypeOrString } from "bun:ffi";

export async function getSymbolsFromZigFiles(files: string[]): Promise<Record<string, FFIFunction>> {
  const out: Record<string, FFIFunction> = {};
  for (const file of files) {
    const content = await Bun.file(file).text();
    Object.assign(out, getSymbolsFromZigFileContent(content));
  }
  return out;
}

export function getSymbolsFromZigFileContent(content: string): Record<string, FFIFunction> {
  const lines = content.split("\n");
  const out: Record<string, FFIFunction> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();

    // allow overrides for bun-ffi-z annotations
    // looks like:
    // bun-ffi-z: myFunction (arg1, arg2) returns
    const annotationsLine = line.match(/\/\/ bun-ffi-z:/);
    if (annotationsLine) {
      const nameStart = line.indexOf(":") + 1;
      const nameEnd = line.indexOf("(");

      out[line.slice(nameStart, nameEnd).trim()] = {
        args: line.slice(nameEnd + 1, line.indexOf(")"))
        .split(",")
        .map(arg => arg.trim())
        .filter(arg => arg) as FFITypeOrString[],
        returns: line.slice(line.indexOf(")") + 1).trim() as FFITypeOrString,
      };
      i++;
      continue;
    }

    const match = line.match(/(?:pub )?export fn (\w+)\(/);
    if (!match || match.length < 2) {
      continue;
    }

    const fnName = match[1];

    let rawArgsAndReturn = line;
    while (!rawArgsAndReturn.includes("{")) {
      rawArgsAndReturn += lines[++i]!.trim();
    }

    const argsStart = rawArgsAndReturn.indexOf("(") + 1;
    const argsEnd = rawArgsAndReturn.indexOf(")");

    const args = rawArgsAndReturn.slice(argsStart, argsEnd)
      .split(",") // split into "name: type"
      .map(arg => arg.trim()) // trim each argument
      .filter(arg => arg) // filter out empty arguments
      .map(arg => arg.split(":")[1]!.trim()) // Get only the type, ignore names
      .map(zigTypeToFfiType);

    const returnStart = rawArgsAndReturn.indexOf(")") + 1;
    const returnEnd = rawArgsAndReturn.indexOf("{");

    const returns = zigTypeToFfiType(rawArgsAndReturn.slice(returnStart, returnEnd).trim());

    out[fnName] = {
      args: args as FFITypeOrString[],
      returns: returns as FFITypeOrString,
    };
  }

  return out;
}

export function zigTypeToFfiType(zigType: string): string {
  if (zigType.startsWith("*") || zigType.startsWith("?*") || zigType.startsWith("[*c]")) return "ptr";

  switch (zigType) {
    case "void":
    case "bool":
    case "u8":
    case "i8":
    case "u16":
    case "i16":
    case "u32":
    case "i32":
    case "u64":
    case "i64":
      return zigType;
    case "c_uint":
      return "u32";
    case "c_int":
      return "i32";
    case "size":
      return "i64";
    case "usize":
      return "u64";
  }

  throw new Error(`Unsupported Zig type: ${zigType}`);
}
