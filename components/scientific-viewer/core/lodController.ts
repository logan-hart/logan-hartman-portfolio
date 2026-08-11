import type { LodLevel, ViewerQuality } from "@/components/scientific-viewer/types";

export const LOD_DISTANCE_THRESHOLDS = {
  promote: {
    1: 5,
    2: 3.2,
    3: 1.8,
  },
  demote: {
    1: 5.6,
    2: 3.7,
    3: 2.2,
  },
  selectedDistanceMultiplier: 0.72,
} as const;

const MANUAL_QUALITY_LEVELS: Record<Exclude<ViewerQuality, "automatic">, LodLevel> = {
  low: 0,
  balanced: 2,
  high: 3,
};

/**
 * Chooses a display LOD only. Download policy is separate, so a high LOD may
 * remain cached while this function demotes the active mesh to reduce GPU work.
 */
export function chooseLod({
  distance,
  currentLevel,
  isSelected,
  quality,
}: {
  distance: number;
  currentLevel: LodLevel | null;
  isSelected: boolean;
  quality: ViewerQuality;
}): LodLevel {
  if (quality !== "automatic") return MANUAL_QUALITY_LEVELS[quality];

  const effectiveDistance =
    distance * (isSelected ? LOD_DISTANCE_THRESHOLDS.selectedDistanceMultiplier : 1);
  let level = currentLevel ?? 0;

  // Promotion and demotion use different thresholds. The gap prevents rapid
  // switching when damped camera motion hovers at one boundary.
  while (
    level < 3 &&
    effectiveDistance <
      LOD_DISTANCE_THRESHOLDS.promote[(level + 1) as 1 | 2 | 3]
  ) {
    level = (level + 1) as LodLevel;
  }
  while (
    level > 0 &&
    effectiveDistance >
      LOD_DISTANCE_THRESHOLDS.demote[level as 1 | 2 | 3]
  ) {
    level = (level - 1) as LodLevel;
  }

  return level;
}
