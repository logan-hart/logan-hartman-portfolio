# H01 seven-mesh demo subset

Two standard, decoder-free GLBs contain the same seven independently selectable
surface meshes:

- `h01-seven-cells.glb` targets 10,000–20,000 triangles per mesh for the case
  study viewer.
- `h01-seven-cells-preview.glb` targets 800–1,200 triangles per mesh (about
  1,000 each) for the lightweight rotating `/work` card.

Both preserve the source meshes' shared H01 coordinate frame. The assets use
the lowest mesh level available in the source layer at build time (LOD 3), are
centered around one shared origin, and are converted from nanometers to
micrometers. They contain geometry and normals only; the portfolio interface
supplies all colors and materials.

This is publicly available H01 geometry, simplified for an interactive
portfolio demonstration. Colors and materials are interface encodings.

Source:

- H01 `proofread_104` mesh layer:
  <https://storage.googleapis.com/h01-release/data/20210601/proofread_104>
- Released-data page:
  <https://h01-release.storage.googleapis.com/data.html>
- Publication: Shapson-Coe et al. (2024), “A petavoxel fragment of human
  cerebral cortex reconstructed at nanoscale resolution”:
  <https://doi.org/10.1126/science.adk4858>
- License: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

The script applies deterministic vertex clustering on a grid anchored at the
absolute source-coordinate origin. It removes collapsed, duplicate, and
zero-area triangles, then recomputes normals. The exact segment IDs,
source-geometry hashes, simplified-geometry hashes, source metadata hash,
output hashes, grid sizes, coordinate transform, counts, and pinned tool
versions are recorded in `manifest.json`.

Rebuild from the repository root:

```sh
uv run --python 3.12 \
  --with-requirements scripts/h01-requirements.txt \
  python scripts/build_h01_demo_asset.py
```
