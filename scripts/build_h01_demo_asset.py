#!/usr/bin/env python3
"""Build two deterministic, browser-ready GLBs from seven public H01 meshes.

The source layer is the H01 release's 104 manually proofread cells. H01's
current lowest surface-mesh level is LOD 3. The script pins that level rather
than requesting ``lod=-1`` so a future source-side LOD addition cannot silently
change the generated assets.

Both GLBs contain the same seven independently selectable meshes in one shared
coordinate frame. A deterministic, integer-nanometer vertex-clustering pass
creates a case-study asset and a lighter rotating-card asset. Geometry and
normals are included; display colors and materials are deliberately left to the
interface.
"""

from __future__ import annotations

import hashlib
import json
import struct
import urllib.request
from dataclasses import dataclass
from importlib.metadata import version
from pathlib import Path
from typing import Any

import numpy as np
from cloudvolume import CloudVolume


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIRECTORY = REPOSITORY_ROOT / "public" / "data" / "h01"
OUTPUT_MANIFEST = OUTPUT_DIRECTORY / "manifest.json"

SOURCE_VOLUME_URL = (
    "https://storage.googleapis.com/h01-release/data/20210601/proofread_104"
)
SOURCE_MESH_INFO_URL = f"{SOURCE_VOLUME_URL}/mesh/info"
SOURCE_DATA_PAGE_URL = "https://h01-release.storage.googleapis.com/data.html"
SOURCE_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
SOURCE_LOD = 3

# Stable presentation order. These are public H01 segment IDs, not inferred
# cell classifications.
SEGMENT_IDS = (
    1072605926,
    810151953,
    620880207,
    1684504313,
    1465400601,
    810970127,
    2047644309,
)

GLTF_ARRAY_BUFFER = 34962
GLTF_ELEMENT_ARRAY_BUFFER = 34963
GLTF_FLOAT = 5126
GLTF_UNSIGNED_SHORT = 5123
GLTF_UNSIGNED_INT = 5125
GLTF_TRIANGLES = 4


@dataclass(frozen=True)
class AssetSpec:
    file_name: str
    key: str
    maximum_triangles_per_mesh: int
    minimum_triangles_per_mesh: int
    target_triangles_per_mesh: int


ASSET_SPECS = (
    AssetSpec(
        file_name="h01-seven-cells.glb",
        key="caseStudy",
        minimum_triangles_per_mesh=10_000,
        maximum_triangles_per_mesh=20_000,
        target_triangles_per_mesh=15_000,
    ),
    AssetSpec(
        file_name="h01-seven-cells-preview.glb",
        key="preview",
        minimum_triangles_per_mesh=800,
        maximum_triangles_per_mesh=1_200,
        target_triangles_per_mesh=1_000,
    ),
)


@dataclass(frozen=True)
class SourceMesh:
    segment_id: int
    vertices_nm: np.ndarray
    faces: np.ndarray
    source_geometry_sha256: str


@dataclass(frozen=True)
class SimplifiedMesh:
    cell_size_nm: int
    collapsed_triangle_count: int
    duplicate_triangle_count: int
    faces: np.ndarray
    segment_id: int
    simplified_geometry_sha256: str
    source_geometry_sha256: str
    vertices_nm: np.ndarray
    zero_area_triangle_count: int


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_geometry_hash(vertices_nm: np.ndarray, faces: np.ndarray) -> str:
    """Hash geometry in an explicit, portable byte layout."""

    digest = hashlib.sha256()
    digest.update(np.asarray(vertices_nm, dtype="<f4").tobytes(order="C"))
    digest.update(np.asarray(faces, dtype="<u4").tobytes(order="C"))
    return digest.hexdigest()


def fetch_source_meshes() -> tuple[list[SourceMesh], bytes]:
    request = urllib.request.Request(
        SOURCE_MESH_INFO_URL,
        headers={"User-Agent": "logan-hartman-portfolio-h01-preprocessor/2.0"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        mesh_info_bytes = response.read()

    mesh_info = json.loads(mesh_info_bytes)
    if mesh_info.get("@type") != "neuroglancer_multilod_draco":
        raise RuntimeError("The H01 mesh source is no longer the expected multi-LOD layer.")

    volume = CloudVolume(
        SOURCE_VOLUME_URL,
        progress=False,
        use_https=True,
        cache=False,
    )
    downloaded = volume.mesh.get(
        SEGMENT_IDS,
        lod=SOURCE_LOD,
        concat=True,
        progress=False,
        allow_missing=False,
    )

    meshes: list[SourceMesh] = []
    for segment_id in SEGMENT_IDS:
        if segment_id not in downloaded:
            raise RuntimeError(f"H01 segment {segment_id} was not returned by CloudVolume.")

        source = downloaded[segment_id]
        vertices_nm = np.ascontiguousarray(source.vertices, dtype="<f4")
        faces = np.ascontiguousarray(source.faces, dtype="<u4")

        if vertices_nm.ndim != 2 or vertices_nm.shape[1] != 3:
            raise RuntimeError(f"Unexpected vertex shape for H01 segment {segment_id}.")
        if faces.ndim != 2 or faces.shape[1] != 3:
            raise RuntimeError(f"Unexpected face shape for H01 segment {segment_id}.")
        if not np.isfinite(vertices_nm).all():
            raise RuntimeError(f"Non-finite vertex found in H01 segment {segment_id}.")
        if faces.size and int(faces.max()) >= len(vertices_nm):
            raise RuntimeError(f"Out-of-range face index in H01 segment {segment_id}.")

        meshes.append(
            SourceMesh(
                segment_id=segment_id,
                vertices_nm=vertices_nm,
                faces=faces,
                source_geometry_sha256=canonical_geometry_hash(vertices_nm, faces),
            )
        )

    return meshes, mesh_info_bytes


def remap_and_deduplicate_faces(
    vertex_mapping: np.ndarray,
    faces: np.ndarray,
) -> tuple[np.ndarray, int, int]:
    remapped = vertex_mapping[faces]
    noncollapsed = (
        (remapped[:, 0] != remapped[:, 1])
        & (remapped[:, 1] != remapped[:, 2])
        & (remapped[:, 0] != remapped[:, 2])
    )
    collapsed_count = int(len(remapped) - np.count_nonzero(noncollapsed))
    remapped = remapped[noncollapsed]

    if not len(remapped):
        return np.empty((0, 3), dtype=np.uint32), collapsed_count, 0

    canonical_faces = np.sort(remapped, axis=1)
    _, first_indices = np.unique(
        canonical_faces,
        axis=0,
        return_index=True,
    )
    first_indices.sort()
    duplicate_count = int(len(remapped) - len(first_indices))
    return (
        np.ascontiguousarray(remapped[first_indices], dtype="<u4"),
        collapsed_count,
        duplicate_count,
    )


def clustered_triangle_count(
    vertices_nm: np.ndarray,
    faces: np.ndarray,
    cell_size_nm: int,
) -> int:
    cells = np.floor(
        vertices_nm.astype(np.float64) / float(cell_size_nm)
    ).astype(np.int64)
    _, vertex_mapping = np.unique(cells, axis=0, return_inverse=True)
    remapped, _, _ = remap_and_deduplicate_faces(vertex_mapping, faces)
    return int(len(remapped))


def choose_cell_size_nm(
    source_mesh: SourceMesh,
    target_triangle_count: int,
) -> int:
    count_cache: dict[int, int] = {}

    def count(cell_size_nm: int) -> int:
        if cell_size_nm not in count_cache:
            count_cache[cell_size_nm] = clustered_triangle_count(
                source_mesh.vertices_nm,
                source_mesh.faces,
                cell_size_nm,
            )
        return count_cache[cell_size_nm]

    lower = 1
    upper = 128
    while count(upper) > target_triangle_count:
        lower = upper
        upper *= 2
        if upper > 1_048_576:
            raise RuntimeError(
                f"Could not bound simplification for H01 segment {source_mesh.segment_id}."
            )

    while upper - lower > 1:
        midpoint = (lower + upper) // 2
        if count(midpoint) > target_triangle_count:
            lower = midpoint
        else:
            upper = midpoint

    candidate_start = max(1, lower - 24)
    candidate_end = upper + 24
    candidates = range(candidate_start, candidate_end + 1)
    return min(
        candidates,
        key=lambda cell_size_nm: (
            abs(count(cell_size_nm) - target_triangle_count),
            cell_size_nm,
        ),
    )


def compact_vertices(
    vertices: np.ndarray,
    faces: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    used_vertices, compact_mapping = np.unique(faces.reshape(-1), return_inverse=True)
    compact_vertices_array = np.ascontiguousarray(vertices[used_vertices], dtype="<f4")
    compact_faces = np.ascontiguousarray(
        compact_mapping.reshape(-1, 3),
        dtype="<u4",
    )
    return compact_vertices_array, compact_faces


def simplify_mesh(
    source_mesh: SourceMesh,
    target_triangle_count: int,
) -> SimplifiedMesh:
    cell_size_nm = choose_cell_size_nm(source_mesh, target_triangle_count)
    cells = np.floor(
        source_mesh.vertices_nm.astype(np.float64) / float(cell_size_nm)
    ).astype(np.int64)
    _, vertex_mapping = np.unique(cells, axis=0, return_inverse=True)
    cluster_count = int(vertex_mapping.max()) + 1

    clustered_vertices = np.column_stack(
        [
            np.bincount(
                vertex_mapping,
                weights=source_mesh.vertices_nm[:, axis],
                minlength=cluster_count,
            )
            for axis in range(3)
        ]
    )
    cluster_sizes = np.bincount(vertex_mapping, minlength=cluster_count)
    clustered_vertices /= cluster_sizes[:, np.newaxis]
    clustered_vertices = np.ascontiguousarray(clustered_vertices, dtype="<f4")

    remapped_faces, collapsed_count, duplicate_count = remap_and_deduplicate_faces(
        vertex_mapping,
        source_mesh.faces,
    )
    vertices_nm, faces = compact_vertices(clustered_vertices, remapped_faces)

    triangle_positions = vertices_nm[faces]
    face_normals = np.cross(
        triangle_positions[:, 1] - triangle_positions[:, 0],
        triangle_positions[:, 2] - triangle_positions[:, 0],
    )
    valid_area = np.linalg.norm(face_normals, axis=1) > 1e-6
    zero_area_count = int(len(faces) - np.count_nonzero(valid_area))
    if zero_area_count:
        vertices_nm, faces = compact_vertices(vertices_nm, faces[valid_area])

    return SimplifiedMesh(
        cell_size_nm=cell_size_nm,
        collapsed_triangle_count=collapsed_count,
        duplicate_triangle_count=duplicate_count,
        faces=faces,
        segment_id=source_mesh.segment_id,
        simplified_geometry_sha256=canonical_geometry_hash(vertices_nm, faces),
        source_geometry_sha256=source_mesh.source_geometry_sha256,
        vertices_nm=vertices_nm,
        zero_area_triangle_count=zero_area_count,
    )


def compute_vertex_normals(
    positions: np.ndarray,
    faces: np.ndarray,
) -> tuple[np.ndarray, int, int]:
    triangle_positions = positions[faces]
    face_normals = np.cross(
        triangle_positions[:, 1] - triangle_positions[:, 0],
        triangle_positions[:, 2] - triangle_positions[:, 0],
    )
    face_lengths = np.linalg.norm(face_normals, axis=1)
    degenerate_triangle_count = int(np.count_nonzero(face_lengths <= 1e-12))

    normals = np.zeros_like(positions, dtype=np.float32)
    np.add.at(normals, faces[:, 0], face_normals)
    np.add.at(normals, faces[:, 1], face_normals)
    np.add.at(normals, faces[:, 2], face_normals)

    normal_lengths = np.linalg.norm(normals, axis=1)
    valid = normal_lengths > 1e-12
    normals[valid] /= normal_lengths[valid, np.newaxis]
    normals[~valid] = (0.0, 0.0, 1.0)
    fallback_normal_count = int(np.count_nonzero(~valid))
    return (
        np.ascontiguousarray(normals, dtype="<f4"),
        degenerate_triangle_count,
        fallback_normal_count,
    )


def shared_origin_nm(source_meshes: list[SourceMesh]) -> np.ndarray:
    combined_min = np.min(
        np.stack([mesh.vertices_nm.min(axis=0) for mesh in source_meshes]),
        axis=0,
    ).astype(np.float64)
    combined_max = np.max(
        np.stack([mesh.vertices_nm.max(axis=0) for mesh in source_meshes]),
        axis=0,
    ).astype(np.float64)
    return (combined_min + combined_max) / 2.0


def pad_to_four_bytes(buffer: bytearray, byte_value: int = 0) -> None:
    while len(buffer) % 4:
        buffer.append(byte_value)


def add_buffer_view(
    binary: bytearray,
    buffer_views: list[dict[str, Any]],
    data: bytes,
    target: int,
) -> int:
    pad_to_four_bytes(binary)
    offset = len(binary)
    binary.extend(data)
    view_index = len(buffer_views)
    buffer_views.append(
        {
            "buffer": 0,
            "byteLength": len(data),
            "byteOffset": offset,
            "target": target,
        }
    )
    return view_index


def build_gltf(
    simplified_meshes: list[SimplifiedMesh],
    asset_spec: AssetSpec,
    mesh_info_sha256: str,
    origin_nm: np.ndarray,
) -> tuple[dict[str, Any], bytes, list[dict[str, Any]]]:
    binary = bytearray()
    accessors: list[dict[str, Any]] = []
    buffer_views: list[dict[str, Any]] = []
    gltf_meshes: list[dict[str, Any]] = []
    nodes: list[dict[str, Any]] = []
    manifest_meshes: list[dict[str, Any]] = []

    for simplified_mesh in simplified_meshes:
        positions_um = np.ascontiguousarray(
            (simplified_mesh.vertices_nm.astype(np.float64) - origin_nm) / 1000.0,
            dtype="<f4",
        )
        normals, degenerate_count, fallback_normal_count = compute_vertex_normals(
            positions_um,
            simplified_mesh.faces,
        )

        if len(positions_um) <= np.iinfo(np.uint16).max:
            indices = np.ascontiguousarray(
                simplified_mesh.faces.reshape(-1),
                dtype="<u2",
            )
            index_component_type = GLTF_UNSIGNED_SHORT
        else:
            indices = np.ascontiguousarray(
                simplified_mesh.faces.reshape(-1),
                dtype="<u4",
            )
            index_component_type = GLTF_UNSIGNED_INT

        position_view = add_buffer_view(
            binary,
            buffer_views,
            positions_um.tobytes(order="C"),
            GLTF_ARRAY_BUFFER,
        )
        position_accessor = len(accessors)
        accessors.append(
            {
                "bufferView": position_view,
                "componentType": GLTF_FLOAT,
                "count": len(positions_um),
                "max": [float(value) for value in positions_um.max(axis=0)],
                "min": [float(value) for value in positions_um.min(axis=0)],
                "type": "VEC3",
            }
        )

        normal_view = add_buffer_view(
            binary,
            buffer_views,
            normals.tobytes(order="C"),
            GLTF_ARRAY_BUFFER,
        )
        normal_accessor = len(accessors)
        accessors.append(
            {
                "bufferView": normal_view,
                "componentType": GLTF_FLOAT,
                "count": len(normals),
                "type": "VEC3",
            }
        )

        index_view = add_buffer_view(
            binary,
            buffer_views,
            indices.tobytes(order="C"),
            GLTF_ELEMENT_ARRAY_BUFFER,
        )
        index_accessor = len(accessors)
        accessors.append(
            {
                "bufferView": index_view,
                "componentType": index_component_type,
                "count": int(indices.size),
                "type": "SCALAR",
            }
        )

        display_name = f"H01 reconstruction {simplified_mesh.segment_id}"
        mesh_index = len(gltf_meshes)
        gltf_meshes.append(
            {
                "extras": {
                    "h01SegmentId": str(simplified_mesh.segment_id),
                    "simplifiedGeometrySha256": (
                        simplified_mesh.simplified_geometry_sha256
                    ),
                    "sourceGeometrySha256": simplified_mesh.source_geometry_sha256,
                    "sourceLod": SOURCE_LOD,
                },
                "name": display_name,
                "primitives": [
                    {
                        "attributes": {
                            "NORMAL": normal_accessor,
                            "POSITION": position_accessor,
                        },
                        "indices": index_accessor,
                        "mode": GLTF_TRIANGLES,
                    }
                ],
            }
        )
        nodes.append(
            {
                "extras": {"h01SegmentId": str(simplified_mesh.segment_id)},
                "mesh": mesh_index,
                "name": display_name,
            }
        )

        manifest_meshes.append(
            {
                "cellSizeNanometers": simplified_mesh.cell_size_nm,
                "collapsedTriangleCount": simplified_mesh.collapsed_triangle_count,
                "degenerateTriangleCount": degenerate_count,
                "duplicateTriangleCount": simplified_mesh.duplicate_triangle_count,
                "fallbackNormalCount": fallback_normal_count,
                "indexComponentType": (
                    "UNSIGNED_SHORT"
                    if index_component_type == GLTF_UNSIGNED_SHORT
                    else "UNSIGNED_INT"
                ),
                "segmentId": str(simplified_mesh.segment_id),
                "simplifiedGeometrySha256": (
                    simplified_mesh.simplified_geometry_sha256
                ),
                "triangleCount": int(len(simplified_mesh.faces)),
                "vertexCount": int(len(simplified_mesh.vertices_nm)),
                "zeroAreaTriangleCountRemoved": (
                    simplified_mesh.zero_area_triangle_count
                ),
            }
        )

    pad_to_four_bytes(binary)
    origin_list = [float(value) for value in origin_nm]
    gltf: dict[str, Any] = {
        "accessors": accessors,
        "asset": {
            "extras": {
                "coordinateTransform": (
                    "positionMicrometers = "
                    "(sourcePositionNanometers - originNanometers) / 1000"
                ),
                "displayNotice": (
                    "Publicly available H01 geometry, simplified for this "
                    "interactive portfolio demonstration."
                ),
                "license": "CC BY 4.0",
                "licenseUrl": SOURCE_LICENSE_URL,
                "meshInfoSha256": mesh_info_sha256,
                "originNanometers": origin_list,
                "simplification": {
                    "algorithm": "integer-nanometer vertex clustering",
                    "targetTrianglesPerMesh": asset_spec.target_triangles_per_mesh,
                },
                "sourceDataPage": SOURCE_DATA_PAGE_URL,
                "sourceLod": SOURCE_LOD,
                "sourceVolume": SOURCE_VOLUME_URL,
                "units": "micrometers",
            },
            "generator": "scripts/build_h01_demo_asset.py",
            "version": "2.0",
        },
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(binary)}],
        "meshes": gltf_meshes,
        "nodes": nodes,
        "scene": 0,
        "scenes": [
            {
                "name": f"H01 seven-mesh {asset_spec.key} subset",
                "nodes": list(range(len(nodes))),
            }
        ],
    }
    return gltf, bytes(binary), manifest_meshes


def encode_glb(gltf: dict[str, Any], binary: bytes) -> bytes:
    json_chunk = bytearray(
        json.dumps(
            gltf,
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
    )
    pad_to_four_bytes(json_chunk, 0x20)

    binary_chunk = bytearray(binary)
    pad_to_four_bytes(binary_chunk)

    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary_chunk)
    header = struct.pack("<4sII", b"glTF", 2, total_length)
    json_header = struct.pack("<I4s", len(json_chunk), b"JSON")
    binary_header = struct.pack("<I4s", len(binary_chunk), b"BIN\x00")
    return bytes(header + json_header + json_chunk + binary_header + binary_chunk)


def validate_glb(
    glb: bytes,
    asset_spec: AssetSpec,
    expected_mesh_count: int,
) -> None:
    magic, glb_version, total_length = struct.unpack_from("<4sII", glb, 0)
    if magic != b"glTF" or glb_version != 2 or total_length != len(glb):
        raise RuntimeError("Generated GLB header is invalid.")

    json_length, json_type = struct.unpack_from("<I4s", glb, 12)
    if json_type != b"JSON":
        raise RuntimeError("Generated GLB is missing its JSON chunk.")
    document = json.loads(glb[20 : 20 + json_length])

    meshes = document.get("meshes", [])
    if len(meshes) != expected_mesh_count:
        raise RuntimeError("Generated GLB does not contain the expected mesh count.")
    if "materials" in document:
        raise RuntimeError("Generated H01 geometry must not bake display materials.")
    if document.get("scene") != 0 or len(document.get("scenes", [])) != 1:
        raise RuntimeError("Generated GLB scene declaration is invalid.")

    for segment_id, mesh in zip(SEGMENT_IDS, meshes, strict=True):
        if str(segment_id) not in mesh.get("name", ""):
            raise RuntimeError(f"Generated GLB mesh name is missing H01 ID {segment_id}.")
        primitive = mesh["primitives"][0]
        if "material" in primitive:
            raise RuntimeError("Generated H01 primitive must not reference a material.")
        triangle_count = document["accessors"][primitive["indices"]]["count"] // 3
        if not (
            asset_spec.minimum_triangles_per_mesh
            <= triangle_count
            <= asset_spec.maximum_triangles_per_mesh
        ):
            raise RuntimeError(
                f"{asset_spec.key} mesh {segment_id} has {triangle_count} triangles; "
                f"expected {asset_spec.minimum_triangles_per_mesh}–"
                f"{asset_spec.maximum_triangles_per_mesh}."
            )

    binary_header_offset = 20 + json_length
    binary_length, binary_type = struct.unpack_from("<I4s", glb, binary_header_offset)
    if binary_type != b"BIN\x00":
        raise RuntimeError("Generated GLB is missing its binary chunk.")
    if binary_length != document["buffers"][0]["byteLength"]:
        raise RuntimeError("Generated GLB binary length does not match its buffer metadata.")


def source_manifest_meshes(source_meshes: list[SourceMesh]) -> list[dict[str, Any]]:
    return [
        {
            "segmentId": str(source_mesh.segment_id),
            "sourceBoundsNanometers": {
                "max": [
                    float(value)
                    for value in source_mesh.vertices_nm.max(axis=0)
                ],
                "min": [
                    float(value)
                    for value in source_mesh.vertices_nm.min(axis=0)
                ],
            },
            "sourceGeometrySha256": source_mesh.source_geometry_sha256,
            "triangleCount": int(len(source_mesh.faces)),
            "vertexCount": int(len(source_mesh.vertices_nm)),
        }
        for source_mesh in source_meshes
    ]


def main() -> None:
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    source_meshes, mesh_info_bytes = fetch_source_meshes()
    mesh_info_sha256 = sha256_hex(mesh_info_bytes)
    origin_nm = shared_origin_nm(source_meshes)
    output_assets: list[dict[str, Any]] = []

    for asset_spec in ASSET_SPECS:
        simplified_meshes = [
            simplify_mesh(
                source_mesh,
                asset_spec.target_triangles_per_mesh,
            )
            for source_mesh in source_meshes
        ]
        gltf, binary, manifest_meshes = build_gltf(
            simplified_meshes,
            asset_spec,
            mesh_info_sha256,
            origin_nm,
        )
        glb = encode_glb(gltf, binary)
        validate_glb(glb, asset_spec, len(SEGMENT_IDS))
        output_path = OUTPUT_DIRECTORY / asset_spec.file_name
        output_path.write_bytes(glb)
        output_assets.append(
            {
                "byteLength": len(glb),
                "file": asset_spec.file_name,
                "key": asset_spec.key,
                "meshCount": len(SEGMENT_IDS),
                "meshes": manifest_meshes,
                "sha256": sha256_hex(glb),
                "targetTrianglesPerMesh": asset_spec.target_triangles_per_mesh,
                "triangleCount": sum(
                    item["triangleCount"] for item in manifest_meshes
                ),
                "vertexCount": sum(
                    item["vertexCount"] for item in manifest_meshes
                ),
            }
        )

    manifest = {
        "assets": output_assets,
        "build": {
            "cloudVolumeVersion": version("cloud-volume"),
            "command": (
                "uv run --python 3.12 --with-requirements "
                "scripts/h01-requirements.txt "
                "python scripts/build_h01_demo_asset.py"
            ),
            "dracoPyVersion": version("DracoPy"),
            "numpyVersion": version("numpy"),
            "script": "scripts/build_h01_demo_asset.py",
            "simplification": {
                "algorithm": "integer-nanometer vertex clustering",
                "description": (
                    "Vertices sharing an absolute-coordinate grid cell are "
                    "averaged; collapsed, duplicate, and zero-area triangles "
                    "are removed; remaining vertices are compacted."
                ),
                "gridAnchorNanometers": [0, 0, 0],
            },
        },
        "coordinateFrame": {
            "originNanometers": [float(value) for value in origin_nm],
            "outputUnits": "micrometers",
            "transform": (
                "positionMicrometers = "
                "(sourcePositionNanometers - originNanometers) / 1000"
            ),
        },
        "notice": (
            "Publicly available H01 geometry, simplified for this interactive "
            "portfolio demonstration. Colors and materials are interface "
            "encodings and are not included in either asset."
        ),
        "schemaVersion": 2,
        "source": {
            "dataPage": SOURCE_DATA_PAGE_URL,
            "license": "CC BY 4.0",
            "licenseUrl": SOURCE_LICENSE_URL,
            "meshInfoSha256": mesh_info_sha256,
            "meshInfoSha256Canonicalization": "raw response bytes",
            "meshInfoUrl": SOURCE_MESH_INFO_URL,
            "meshLod": SOURCE_LOD,
            "meshLodDescription": (
                "Lowest level available in the H01 proofread_104 mesh layer "
                "at build time; pinned to level 3 for reproducibility."
            ),
            "meshes": source_manifest_meshes(source_meshes),
            "segmentIds": [str(segment_id) for segment_id in SEGMENT_IDS],
            "sourceGeometrySha256Canonicalization": (
                "little-endian float32 XYZ nanometer positions followed by "
                "little-endian uint32 triangle indices"
            ),
            "volumeUrl": SOURCE_VOLUME_URL,
        },
    }
    OUTPUT_MANIFEST.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                asset["key"]: {
                    "asset": f"public/data/h01/{asset['file']}",
                    "bytes": asset["byteLength"],
                    "meshes": asset["meshCount"],
                    "sha256": asset["sha256"],
                    "triangles": asset["triangleCount"],
                    "vertices": asset["vertexCount"],
                }
                for asset in output_assets
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
