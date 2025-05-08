# bun-ffi-z

Library to use and publish shared libraries for `bun:ffi`.

## Usage

1. Add bun-ffi-z dependency

```bash
bun install @chainsafe/bun-ffi-z
```

2. Add bun-ffi-z section to package.json

```json
  "bun-ffi-z": {
    "name": "example",
    "targets": [
      "linux-x64-gnu",
      "linux-arm64-gnu",
      "linux-x64-musl",
      "linux-arm64-musl",
      "darwin-x64",
      "darwin-arm64",
      "win32-x64"
    ],
    "zigCwd": "zig"
  }
```

4. Use bun-ffi-z to select the proper library

```ts
import {openLibrary} from "@chainsafe/bun-ffi-z";

const lib = await openLibrary(
  import.meta.dirname,
  {
    add: {
      args: ["u32", "u32"],
      returns: "u32"
    }
  }
)

export const symbols = lib.symbols;
export const close = lib.close;
```

5. Build shared library for native host
```bash
bun-ffi-z build
```

6. Cross-compile shared libraries for all targets into `targetPackages` subdirectory

```bash
bun-ffi-z prepublish
```

7. Publish package and all target packages

```bash
bun-ffi-z publish
```

## License

MIT
