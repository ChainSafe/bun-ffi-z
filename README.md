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
      "x86_64-linux-gnu",
      "aarch64-linux-gnu",
      "x86_64-linux-musl",
      "aarch64-linux-musl",
      "x86_64-macos-none",
      "aarch64-macos-none"
    ],
    "zigCwd": ".."
  }
```

Note that:
  - `targets` list follows Zig's target tripple convention
  - `zigCwd` is relative to Bun directory.

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

6. On publish CI, prepare an "artifacts" subdirectory which contains all prebuilt binaries
```yml
  - name: Download all artifacts
    if: ${{ steps.release.outputs.release_created }}
    uses: actions/download-artifact@v4
    with:
      path: artifacts
```

7. Prepare `targetPackages` subdirectory by copying prebuilt binaries inside "artifacts" folder prepared above

```bash
bun-ffi-z prepublish --artifacts artifacts
```

7. Publish the root package and all target packages prepared above in `targetPackages` subdirectory

```bash
bun-ffi-z publish
```

## License

MIT
