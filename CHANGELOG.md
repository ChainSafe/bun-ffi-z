# Changelog

## [1.1.3](https://github.com/ChainSafe/bun-ffi-z/compare/bun-ffi-z-v1.1.2...bun-ffi-z-v1.1.3) (2025-09-24)


### Bug Fixes

* stricter tsconfig ([#15](https://github.com/ChainSafe/bun-ffi-z/issues/15)) ([4accd07](https://github.com/ChainSafe/bun-ffi-z/commit/4accd07e7430a8789420ec9eddfa6ce7856671ca))

## [1.1.2](https://github.com/ChainSafe/bun-ffi-z/compare/bun-ffi-z-v1.1.1...bun-ffi-z-v1.1.2) (2025-09-24)


### Bug Fixes

* update comment ([#13](https://github.com/ChainSafe/bun-ffi-z/issues/13)) ([98beffa](https://github.com/ChainSafe/bun-ffi-z/commit/98beffae8a1c9cf7cccc382089fe8a9fbd617fb4))

## [1.1.1](https://github.com/ChainSafe/bun-ffi-z/compare/bun-ffi-z-v1.1.0...bun-ffi-z-v1.1.1) (2025-07-04)


### Bug Fixes

* update generateBinding.ts ([d0911fb](https://github.com/ChainSafe/bun-ffi-z/commit/d0911fb16f9dcc209b390002e573dba2dda2cc8b))

## [1.1.0](https://github.com/ChainSafe/bun-ffi-z/compare/bun-ffi-z-v1.0.0...bun-ffi-z-v1.1.0) (2025-06-16)


### Features

* add generate-binding command ([f210c56](https://github.com/ChainSafe/bun-ffi-z/commit/f210c569c84dda75d2a1b05f34009eb98457fb78))
* add generate-binding command ([9e2012b](https://github.com/ChainSafe/bun-ffi-z/commit/9e2012be3f98582b67732dc2e78d19a57999f2bc))


### Bug Fixes

* add exports to package.json ([d8da797](https://github.com/ChainSafe/bun-ffi-z/commit/d8da7972d7ca4191bf6c755c0a2d6f05db43472c))
* add exports to package.json ([5f3ec3a](https://github.com/ChainSafe/bun-ffi-z/commit/5f3ec3a86b7b7cc0c3b71b75f1e6f6c00d078766))
* correct file path ([d738ce8](https://github.com/ChainSafe/bun-ffi-z/commit/d738ce8fbc900dfd51d33e7cf471c60e13b13a60))
* export binding ([179cdd1](https://github.com/ChainSafe/bun-ffi-z/commit/179cdd129bb75ed849112756666ce860ee68c3f1))
* extract function name from RegEx ([2d4c17a](https://github.com/ChainSafe/bun-ffi-z/commit/2d4c17a4aed8c127c3452adbe2bc10cf4856c482))

## 1.0.0 (2025-05-20)


### Features

* add artifacts param to prepublish cli command ([cf12a4b](https://github.com/ChainSafe/bun-ffi-z/commit/cf12a4b15b6fb3227d40a59e83e6000000c064f2))
* add prebuilt binaries param to prepublish command ([81b828f](https://github.com/ChainSafe/bun-ffi-z/commit/81b828f31fa717bbe998cccbddf801dc1624dfe8))
* add release workflow using release-please action ([#6](https://github.com/ChainSafe/bun-ffi-z/issues/6)) ([4c091bd](https://github.com/ChainSafe/bun-ffi-z/commit/4c091bd6725a4fb9f329276c0ff40630ce55f2ad))
* support build fallback in prepublish ([7763c07](https://github.com/ChainSafe/bun-ffi-z/commit/7763c0705bf102e2475c14df162baf0f8da18458))


### Bug Fixes

* add npm token to publish step ([e55c384](https://github.com/ChainSafe/bun-ffi-z/commit/e55c384a9555a2d9e02df8c3031ecf985fd5f001))
* artifact dir to point to zig target tripple ([45d27e9](https://github.com/ChainSafe/bun-ffi-z/commit/45d27e995b9c52104b6877aae34da1f1a8471dec))
* both artifacts and targetPackages are relative to bun folder ([3c041c0](https://github.com/ChainSafe/bun-ffi-z/commit/3c041c0ff905f4b80749cb8fa39f76a1811f5edc))
* correct library path to published packages ([#5](https://github.com/ChainSafe/bun-ffi-z/issues/5)) ([baaac3f](https://github.com/ChainSafe/bun-ffi-z/commit/baaac3f821c87cab2fadf408e1775914bad3841f))
* correct targets list in README ([b118b77](https://github.com/ChainSafe/bun-ffi-z/commit/b118b77e82b9885f0bffdf2cfe7435441829abdb))
* correct zig target tripple for macos ([b0cbeda](https://github.com/ChainSafe/bun-ffi-z/commit/b0cbedaaa216c45c69eb17d6c24ff237d23df6d2))
* fix openLibrary api ([#2](https://github.com/ChainSafe/bun-ffi-z/issues/2)) ([3265ec3](https://github.com/ChainSafe/bun-ffi-z/commit/3265ec3d5e2ac1d050f109281fcee5fb77eecb41))
* fix zig build params ([#1](https://github.com/ChainSafe/bun-ffi-z/issues/1)) ([8773e13](https://github.com/ChainSafe/bun-ffi-z/commit/8773e13f446122805f994c5589a17df9b37d88c8))
* index guildeline ([70a675e](https://github.com/ChainSafe/bun-ffi-z/commit/70a675e5f9f1e1e5109bf70f6d5bccc3b5acbf1a))
* more details on artifactDir check error ([74b3538](https://github.com/ChainSafe/bun-ffi-z/commit/74b3538a79e80ffb983af70bcdc47b0c67f145a7))
* update initial version ([bdf599a](https://github.com/ChainSafe/bun-ffi-z/commit/bdf599a0b781d66b9c7ac7eeb79e2c3a79b54ee2))
* update release-please configuration ([5aa6e98](https://github.com/ChainSafe/bun-ffi-z/commit/5aa6e98956584c850374db1c6577320bb4b07af4))
* use node api to check folder exist ([56f8996](https://github.com/ChainSafe/bun-ffi-z/commit/56f89968f90222aba76e5aeed5efe204eb90351f))
