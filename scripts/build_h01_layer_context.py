#!/usr/bin/env python3
"""Build a deterministic cortical-layer crop for the scientific viewer.

The public H01 layer segmentation shares a coordinate frame with the public
proofread-cell meshes used by this portfolio. This offline-only script reads a
fixed mip-2 crop around the selected cells and extracts labels 1–3 with
marching cubes. The browser receives ordinary surface geometry; it never
downloads or interprets the source segmentation.
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
from skimage.measure import marching_cubes


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
H01_DIRECTORY = REPOSITORY_ROOT / "public" / "data" / "h01"
CELL_MANIFEST = H01_DIRECTORY / "manifest.json"
OUTPUT_FILE = H01_DIRECTORY / "h01-layer-context.glb"
OUTPUT_MANIFEST = H01_DIRECTORY / "h01-layer-context-manifest.json"

SOURCE_VOLUME_URL = (
    "https://storage.googleapis.com/h01-release/data/20210601/layers"
)
SOURCE_INFO_URL = f"{SOURCE_VOLUME_URL}/info"
SOURCE_PROPERTIES_URL = f"{SOURCE_VOLUME_URL}/segment_properties/info"
SOURCE_DATA_PAGE_URL = "https://h01-release.storage.googleapis.com/data.html"
SOURCE_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
SOURCE_MIP = 2

# This crop encloses the portfolio cell subset plus a small XY margin. H01 mip
# 2 has 2,000 × 2,000 × 2,112 nm voxels. The full 83-voxel tissue depth is kept.
CROP_MIN = np.array([1240, 160, 0], dtype=np.int64)
CROP_MAX = np.array([1540, 565, 83], dtype=np.int64)
LAYER_LABELS = (1, 2, 3)

GLTF_ARRAY_BUFFER = 34962
GLTF_ELEMENT_ARRAY_BUFFER = 34963
GLTF_FLOAT = 5126
GLTF_UNSIGNED_INT = 5125
GLTF_TRIANGLES = 4


@dataclass(frozen=True)
class LayerMesh:
    label: int
    name: str
    positions_um: np.ndarray
    normals: np.ndarray
    faces: np.ndarray


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "logan-hartman-portfolio-h01-layer-preprocessor/1.0"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


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


def compute_vertex_normals(
    positions: np.ndarray,
    faces: np.ndarray,
) -> np.ndarray:
    triangles = positions[faces]
    face_normals = np.cross(
        triangles[:, 1] - triangles[:, 0],
        triangles[:, 2] - triangles[:, 0],
    )
    normals = np.zeros_like(positions, dtype=np.float32)
    np.add.at(normals, faces[:, 0], face_normals)
    np.add.at(normals, faces[:, 1], face_normals)
    np.add.at(normals, faces[:, 2], face_normals)
    lengths = np.linalg.norm(normals, axis=1)
    valid = lengths > 1e-12
    normals[valid] /= lengths[valid, np.newaxis]
    normals[~valid] = (0.0, 0.0, 1.0)
    return np.ascontiguousarray(normals, dtype="<f4")


def extract_layer_meshes(
    segmentation: np.ndarray,
    resolution_nm: np.ndarray,
    origin_nm: np.ndarray,
    label_names: dict[int, str],
) -> list[LayerMesh]:
    resolution_um = resolution_nm.astype(np.float64) / 1000.0
    # Padding closes surfaces at the crop boundary. Padded voxel index 1 maps
    # back to CROP_MIN, so subtract one voxel from the physical crop origin.
    padded_origin_um = (CROP_MIN - 1) * resolution_um
    output_origin_um = origin_nm.astype(np.float64) / 1000.0
    meshes: list[LayerMesh] = []

    for label in LAYER_LABELS:
        mask = np.pad(segmentation == label, 1, mode="constant")
        if not np.any(mask):
            raise RuntimeError(f"H01 layer label {label} does not intersect the crop.")
        vertices, faces, _, _ = marching_cubes(
            mask,
            level=0.5,
            spacing=tuple(float(value) for value in resolution_um),
            allow_degenerate=False,
        )
        positions_um = np.ascontiguousarray(
            vertices.astype(np.float64) + padded_origin_um - output_origin_um,
            dtype="<f4",
        )
        face_indices = np.ascontiguousarray(faces, dtype="<u4")
        meshes.append(
            LayerMesh(
                label=label,
                name=label_names[label],
                positions_um=positions_um,
                normals=compute_vertex_normals(positions_um, face_indices),
                faces=face_indices,
            )
        )

    return meshes


def build_gltf(
    meshes: list[LayerMesh],
    origin_nm: np.ndarray,
    resolution_nm: np.ndarray,
    source_hashes: dict[str, str],
) -> tuple[dict[str, Any], bytes]:
    binary = bytearray()
    accessors: list[dict[str, Any]] = []
    buffer_views: list[dict[str, Any]] = []
    gltf_meshes: list[dict[str, Any]] = []
    nodes: list[dict[str, Any]] = []

    for mesh in meshes:
        position_view = add_buffer_view(
            binary,
            buffer_views,
            mesh.positions_um.tobytes(order="C"),
            GLTF_ARRAY_BUFFER,
        )
        position_accessor = len(accessors)
        accessors.append(
            {
                "bufferView": position_view,
                "componentType": GLTF_FLOAT,
                "count": len(mesh.positions_um),
                "max": [float(value) for value in mesh.positions_um.max(axis=0)],
                "min": [float(value) for value in mesh.positions_um.min(axis=0)],
                "type": "VEC3",
            }
        )
        normal_view = add_buffer_view(
            binary,
            buffer_views,
            mesh.normals.tobytes(order="C"),
            GLTF_ARRAY_BUFFER,
        )
        normal_accessor = len(accessors)
        accessors.append(
            {
                "bufferView": normal_view,
                "componentType": GLTF_FLOAT,
                "count": len(mesh.normals),
                "type": "VEC3",
            }
        )
        indices = np.ascontiguousarray(mesh.faces.reshape(-1), dtype="<u4")
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
                "componentType": GLTF_UNSIGNED_INT,
                "count": int(indices.size),
                "type": "SCALAR",
            }
        )
        display_name = f"H01 cortical layer {mesh.label} crop"
        mesh_index = len(gltf_meshes)
        gltf_meshes.append(
            {
                "extras": {"h01LayerLabel": mesh.label, "sourceName": mesh.name},
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
                "extras": {"h01LayerLabel": mesh.label},
                "mesh": mesh_index,
                "name": display_name,
            }
        )

    pad_to_four_bytes(binary)
    gltf: dict[str, Any] = {
        "accessors": accessors,
        "asset": {
            "extras": {
                "coordinateTransform": (
                    "positionMicrometers = "
                    "(sourcePositionNanometers - originNanometers) / 1000"
                ),
                "cropMaxVoxelExclusive": CROP_MAX.tolist(),
                "cropMinVoxelInclusive": CROP_MIN.tolist(),
                "license": "CC BY 4.0",
                "licenseUrl": SOURCE_LICENSE_URL,
                "originNanometers": [float(value) for value in origin_nm],
                "resolutionNanometers": [float(value) for value in resolution_nm],
                "sourceDataPage": SOURCE_DATA_PAGE_URL,
                "sourceHashes": source_hashes,
                "sourceMip": SOURCE_MIP,
                "sourceVolume": SOURCE_VOLUME_URL,
                "surfaceExtraction": "scikit-image marching_cubes at isovalue 0.5",
                "units": "micrometers",
            },
            "generator": "scripts/build_h01_layer_context.py",
            "version": "2.0",
        },
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(binary)}],
        "meshes": gltf_meshes,
        "nodes": nodes,
        "scene": 0,
        "scenes": [
            {
                "name": "H01 cortical-layer context crop",
                "nodes": list(range(len(nodes))),
            }
        ],
    }
    return gltf, bytes(binary)


def encode_glb(gltf: dict[str, Any], binary: bytes) -> bytes:
    json_chunk = bytearray(
        json.dumps(gltf, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode(
            "utf-8"
        )
    )
    pad_to_four_bytes(json_chunk, 0x20)
    binary_chunk = bytearray(binary)
    pad_to_four_bytes(binary_chunk)
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary_chunk)
    return bytes(
        struct.pack("<4sII", b"glTF", 2, total_length)
        + struct.pack("<I4s", len(json_chunk), b"JSON")
        + json_chunk
        + struct.pack("<I4s", len(binary_chunk), b"BIN\x00")
        + binary_chunk
    )


def main() -> None:
    cell_manifest = json.loads(CELL_MANIFEST.read_text(encoding="utf-8"))
    origin_nm = np.asarray(
        cell_manifest["coordinateFrame"]["originNanometers"], dtype=np.float64
    )
    info_bytes = fetch_bytes(SOURCE_INFO_URL)
    properties_bytes = fetch_bytes(SOURCE_PROPERTIES_URL)
    info = json.loads(info_bytes)
    properties = json.loads(properties_bytes)["inline"]
    label_names = {
        int(identifier): name
        for identifier, name in zip(
            properties["ids"], properties["properties"][0]["values"], strict=True
        )
    }
    scale = info["scales"][SOURCE_MIP]
    resolution_nm = np.asarray(scale["resolution"], dtype=np.float64)
    expected_resolution = np.array([2000.0, 2000.0, 2112.0])
    if not np.array_equal(resolution_nm, expected_resolution):
        raise RuntimeError(
            f"Unexpected H01 mip-{SOURCE_MIP} resolution: {resolution_nm.tolist()}."
        )

    volume = CloudVolume(
        SOURCE_VOLUME_URL,
        mip=SOURCE_MIP,
        progress=False,
        use_https=True,
        cache=False,
    )
    segmentation = np.asarray(
        volume[
            CROP_MIN[0] : CROP_MAX[0],
            CROP_MIN[1] : CROP_MAX[1],
            CROP_MIN[2] : CROP_MAX[2],
        ]
    )[..., 0]
    expected_shape = tuple((CROP_MAX - CROP_MIN).tolist())
    if segmentation.shape != expected_shape:
        raise RuntimeError(
            f"Unexpected crop shape {segmentation.shape}; expected {expected_shape}."
        )
    unexpected_labels = set(int(value) for value in np.unique(segmentation)) - {
        0,
        *LAYER_LABELS,
    }
    if unexpected_labels:
        raise RuntimeError(f"Unexpected labels intersect the crop: {unexpected_labels}.")

    meshes = extract_layer_meshes(
        segmentation,
        resolution_nm,
        origin_nm,
        label_names,
    )
    source_hashes = {
        "infoSha256": sha256_hex(info_bytes),
        "segmentPropertiesSha256": sha256_hex(properties_bytes),
        "segmentationCropSha256": sha256_hex(
            np.ascontiguousarray(segmentation, dtype="<u8").tobytes(order="C")
        ),
    }
    gltf, binary = build_gltf(meshes, origin_nm, resolution_nm, source_hashes)
    glb = encode_glb(gltf, binary)
    H01_DIRECTORY.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_bytes(glb)

    manifest = {
        "asset": {
            "byteLength": len(glb),
            "file": OUTPUT_FILE.name,
            "meshCount": len(meshes),
            "sha256": sha256_hex(glb),
            "triangleCount": sum(len(mesh.faces) for mesh in meshes),
            "vertexCount": sum(len(mesh.positions_um) for mesh in meshes),
        },
        "build": {
            "cloudVolumeVersion": version("cloud-volume"),
            "command": "npm run assets:source:layers",
            "numpyVersion": version("numpy"),
            "scikitImageVersion": version("scikit-image"),
            "script": "scripts/build_h01_layer_context.py",
            "surfaceExtraction": (
                "marching cubes at isovalue 0.5; one-voxel zero padding "
                "closes crop boundaries"
            ),
        },
        "coordinateFrame": {
            "originNanometers": [float(value) for value in origin_nm],
            "outputUnits": "micrometers",
        },
        "layers": [
            {
                "label": mesh.label,
                "name": mesh.name,
                "triangleCount": len(mesh.faces),
                "vertexCount": len(mesh.positions_um),
            }
            for mesh in meshes
        ],
        "schemaVersion": 1,
        "source": {
            "cropMaxVoxelExclusive": CROP_MAX.tolist(),
            "cropMinVoxelInclusive": CROP_MIN.tolist(),
            "dataPage": SOURCE_DATA_PAGE_URL,
            "hashes": source_hashes,
            "labels": list(LAYER_LABELS),
            "license": "CC BY 4.0",
            "licenseUrl": SOURCE_LICENSE_URL,
            "mip": SOURCE_MIP,
            "resolutionNanometers": [float(value) for value in resolution_nm],
            "volumeUrl": SOURCE_VOLUME_URL,
        },
    }
    OUTPUT_MANIFEST.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(manifest["asset"], indent=2))


if __name__ == "__main__":
    main()
