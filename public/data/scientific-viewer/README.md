# Progressive scientific-viewer assets

`generated/` contains four independently loadable, decoder-ready GLBs for each
of ten public H01 surface meshes: three cortical-layer context surfaces and
seven proofread cells. `manifest.json` records stable structure
IDs, the shared coordinate frame, actual triangle counts, byte sizes, SHA-256
hashes, default presentation state, source attribution, and build metadata.

The public surface meshes are unrelated to the professional Albert Einstein
College of Medicine engagement. They contain no proprietary source code,
institutional assets, research results, or patient information. Demonstration
names and colors are interface encodings, not medical classifications.

Rebuild from the repository root:

```sh
npm ci
npm run assets:build
```

The Node script reads the proofread-cell GLB and the bounded cortical-layer
source GLB, isolates each structure, and applies glTF-Transform with
meshoptimizer. Cell LODs target 8%, 25%, 50%, and 100%; broad context surfaces
target 3%, 12%, 35%, and 100%. Actual values are recorded because thin,
disconnected geometry may stop simplifying before an ideal target would
damage its topology. Generated files use
`EXT_meshopt_compression`; Three.js `GLTFLoader` receives `MeshoptDecoder` at
runtime.

See [`../../../THIRD_PARTY_NOTICES.md`](../../../THIRD_PARTY_NOTICES.md) for
full software license notices and public-data attribution.
