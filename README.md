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
    "zigCwd": "zig",
    "zigExportFiles": [
      "src/root.zig"
    ]
  }
```

4. Use bun-ffi-z to generate the bun ffi binding
```bash
bun-ffi-z generate-binding
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

Note that both `targetPackages` and `artifacts` are relative to bun folder.

8. Publish the root package and all target packages prepared above in `targetPackages` subdirectory

```bash
bun-ffi-z publish
```

## License

MIT
