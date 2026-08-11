# Third-Party Notices

This file records third-party software and public data used by the independent
scientific-visualization demonstration. It does not describe or license any
proprietary professional application, institutional asset, research result, or
patient information.

## meshoptimizer

Used for offline mesh simplification, vertex/index optimization, quantization,
and `EXT_meshopt_compression`, and for browser-side decoding of generated GLBs.

MIT License

Copyright (c) 2016-2026 Arseny Kapoulkine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Source: <https://github.com/zeux/meshoptimizer>

## glTF-Transform

The `@gltf-transform/core`, `@gltf-transform/extensions`, and
`@gltf-transform/functions` packages are used by the offline asset build.

The MIT License (MIT)

Copyright (c) 2024 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Source: <https://github.com/donmccurdy/glTF-Transform>

## Public H01 demonstration geometry

The independent public demonstration uses seven surface reconstructions from
the H01 `proofread_104` mesh layer and three bounded surfaces extracted from
labels 1–3 of the H01 cortical-layer segmentation. H01 publishes these sources
under Creative Commons Attribution 4.0. The source geometry is unrelated to
the Albert Einstein College of Medicine engagement. Layer names follow H01's
public source metadata; display colors are interface encodings and do not make
medical claims.

The layer crop is converted to surface geometry offline with scikit-image
0.25.2 marching cubes. The exact voxel bounds, resolution, source metadata
hashes, and generated geometry counts are retained in
`public/data/h01/h01-layer-context-manifest.json`.

- Released-data page: <https://h01-release.storage.googleapis.com/data.html>
- Publication: Shapson-Coe et al. (2024), “A petavoxel fragment of human
  cerebral cortex reconstructed at nanoscale resolution”:
  <https://doi.org/10.1126/science.adk4858>
- License: <https://creativecommons.org/licenses/by/4.0/>
