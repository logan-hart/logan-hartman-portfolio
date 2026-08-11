import type {
  ScientificViewerManifest,
  StructureDisplayState,
} from "@/components/scientific-viewer/types";

export type StructureRegistry = Record<string, StructureDisplayState>;

export function createStructureRegistry(
  manifest: ScientificViewerManifest,
): StructureRegistry {
  return Object.fromEntries(
    manifest.structures.map((structure) => [
      structure.id,
      {
        visible: structure.visible,
        opacity: structure.defaultOpacity,
        color: structure.defaultColor,
      },
    ]),
  );
}

export function updateStructure(
  registry: StructureRegistry,
  structureId: string,
  patch: Partial<StructureDisplayState>,
): StructureRegistry {
  if (!registry[structureId]) return registry;
  return {
    ...registry,
    [structureId]: { ...registry[structureId], ...patch },
  };
}

export function setAllVisibility(
  registry: StructureRegistry,
  visible: boolean,
): StructureRegistry {
  return Object.fromEntries(
    Object.entries(registry).map(([id, state]) => [id, { ...state, visible }]),
  );
}

export function setAllOpacity(
  registry: StructureRegistry,
  opacity: number,
): StructureRegistry {
  return Object.fromEntries(
    Object.entries(registry).map(([id, state]) => [id, { ...state, opacity }]),
  );
}
