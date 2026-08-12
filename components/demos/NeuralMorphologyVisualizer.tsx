"use client";

import {
  Boxes,
  Eye,
  EyeOff,
  Focus,
  Gauge,
  Link2,
  Link2Off,
  LoaderCircle,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { validateManifest } from "@/components/scientific-viewer/core/manifest";
import {
  createStructureRegistry,
  setAllVisibility,
  updateStructure,
  type StructureRegistry,
} from "@/components/scientific-viewer/core/structureRegistry";
import {
  ViewerCanvas,
  type ViewerCanvasHandle,
} from "@/components/scientific-viewer/ViewerCanvas";
import type {
  CameraPose,
  ScientificViewerManifest,
  ViewerMetrics,
  ViewerQuality,
} from "@/components/scientific-viewer/types";

const MANIFEST_URL = "/data/scientific-viewer/manifest.json";

function formatDuration(value: number | null) {
  return value === null ? "Measuring…" : `${Math.round(value).toLocaleString()} ms`;
}

function formatBytes(value: number) {
  if (!value) return "0 KB";
  if (value < 1_000_000) return `${(value / 1_000).toFixed(0)} KB`;
  return `${(value / 1_000_000).toFixed(2)} MB`;
}

function formatTriangles(value: number) {
  return value ? value.toLocaleString() : "—";
}

function formatRequestCount(value: number) {
  return `${value} ${value === 1 ? "request" : "requests"}`;
}

function formatCompactTriangles(value: number) {
  if (!value) return "—";
  return value >= 10_000 ? `${(value / 1_000).toFixed(0)}k` : `${(value / 1_000).toFixed(1)}k`;
}

function emptyMetrics(mode: "baseline" | "progressive"): ViewerMetrics {
  return {
    mode,
    startedAt: 0,
    firstGeometryMs: null,
    firstMeaningfulRenderMs: null,
    interactiveMs: null,
    highestRequestedLodReadyMs: null,
    startupBytes: 0,
    startupRequests: 0,
    startupTriangles: 0,
    requestedBytes: 0,
    assetRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    currentTriangles: 0,
    totalLoadedTriangles: 0,
    structures: {},
  };
}

function MetricsPanel({
  baseline,
  progressive,
}: {
  baseline: ViewerMetrics;
  progressive: ViewerMetrics;
}) {
  const improvement =
    baseline.firstMeaningfulRenderMs && progressive.firstMeaningfulRenderMs
      ? ((baseline.firstMeaningfulRenderMs - progressive.firstMeaningfulRenderMs) /
          baseline.firstMeaningfulRenderMs) *
        100
      : null;
  const meaningfulRenderDelta =
    baseline.firstMeaningfulRenderMs && progressive.firstMeaningfulRenderMs
      ? baseline.firstMeaningfulRenderMs - progressive.firstMeaningfulRenderMs
      : null;
  const startupTransferReduction =
    baseline.startupBytes > 0 && progressive.startupBytes > 0
      ? (1 - progressive.startupBytes / baseline.startupBytes) * 100
      : null;

  return (
    <section aria-label="Live performance comparison" className="scientific-demo__performance">
      <div className="scientific-demo__performance-heading">
        <div>
          <span className="scientific-demo__kicker">Live browser measurement</span>
          <h4>Same geometry, different delivery pipeline</h4>
        </div>
        <p>
          {improvement === null
            ? "Run in progress. Results reflect this browser session only."
            : `The coarse scene became interactive ${Math.abs(
                Math.round(meaningfulRenderDelta ?? 0),
              ).toLocaleString()} ms ${improvement >= 0 ? "earlier" : "later"} than the full-source baseline in this run (${Math.abs(improvement).toFixed(1)}%), with ${startupTransferReduction?.toFixed(1)}% less startup geometry transfer.`}
        </p>
      </div>
      <div className="scientific-demo__metric-grid">
        <article>
          <span>First geometry</span>
          <strong>{formatDuration(baseline.firstGeometryMs)}</strong>
          <small>Baseline</small>
          <strong>{formatDuration(progressive.firstGeometryMs)}</strong>
          <small>Progressive LOD</small>
        </article>
        <article>
          <span>Meaningful render / interactive</span>
          <strong>{formatDuration(baseline.firstMeaningfulRenderMs)}</strong>
          <small>Baseline · interactive {formatDuration(baseline.interactiveMs)}</small>
          <strong>{formatDuration(progressive.firstMeaningfulRenderMs)}</strong>
          <small>Progressive · interactive {formatDuration(progressive.interactiveMs)}</small>
        </article>
        <article>
          <span>Startup network</span>
          <strong>{formatBytes(baseline.startupBytes)}</strong>
          <small>{formatRequestCount(baseline.startupRequests)} · {formatBytes(baseline.requestedBytes)} now</small>
          <strong>{formatBytes(progressive.startupBytes)}</strong>
          <small>{formatRequestCount(progressive.startupRequests)} · {formatBytes(progressive.requestedBytes)} now</small>
        </article>
        <article>
          <span>Startup GPU work</span>
          <strong>{formatTriangles(baseline.startupTriangles)}</strong>
          <small>{formatTriangles(baseline.currentTriangles)} rendered now</small>
          <strong>{formatTriangles(progressive.startupTriangles)}</strong>
          <small>{formatTriangles(progressive.currentTriangles)} rendered now</small>
        </article>
        <article>
          <span>Parsed LOD reuse</span>
          <strong>{baseline.cacheHits} cache hits</strong>
          <small>{baseline.cacheMisses} unique baseline loads</small>
          <strong>{progressive.cacheHits} cache hits</strong>
          <small>{progressive.cacheMisses} unique progressive loads</small>
        </article>
      </div>
      <details>
        <summary>Metric definitions and test conditions</summary>
        <div className="scientific-demo__definitions">
          <p><strong>First geometry</strong> is the first parsed mesh committed to the scene.</p>
          <p><strong>First meaningful render</strong> is when all ten visible structures are usable: original full-resolution source geometry for baseline, packed meshopt LOD 0 for progressive.</p>
          <p><strong>Time to interactive</strong> matches meaningful render in this demo because camera and structure controls are enabled as soon as the initial scene is complete.</p>
          <p><strong>Startup network</strong> is the GLB data required before the initial scene becomes interactive: two original public source GLBs for baseline and one packed meshopt LOD 0 GLB for progressive. “Now” includes detail requested after interaction.</p>
          <p><strong>Startup GPU work</strong> is the triangle count committed at meaningful render. The smaller line reports what the camera currently renders.</p>
          <p><strong>Current requested detail ready:</strong> baseline {formatDuration(baseline.highestRequestedLodReadyMs)}; progressive {formatDuration(progressive.highestRequestedLodReadyMs)}. This updates when camera, selection, or quality requests finish; progressive does not download unneeded LODs.</p>
          <p><strong>Application cache</strong> tracks parsed geometry reuse and request deduplication; it is separate from the browser HTTP cache and the active scene mesh.</p>
          <p><strong>Conditions</strong> use this browser, device, viewport, production or development build, and current network. Both viewers use the same origin and start together with `fetch` cache disabled for a comparable cold run. Results are illustrative, not a cross-device benchmark.</p>
        </div>
      </details>
    </section>
  );
}

function ArchitectureDiagram() {
  const nodes = [
    "Public cells + cropped layer source",
    "Offline glTF-Transform + meshoptimizer",
    "Packed LOD 0 bootstrap · individual LOD 1–3",
    "Unified scene manifest",
    "Progressive loader + in-memory cache",
    "Three.js scene",
    "Structure + camera controls",
  ];
  return (
    <section className="scientific-demo__explanation" id="scientific-architecture">
      <div>
        <span className="scientific-demo__kicker">Architecture</span>
        <h4>Complexity stays offline; runtime policy stays visible</h4>
        <p>
          Each public surface mesh remains independently identifiable, but one manifest aligns them in a shared coordinate system and drives one scene registry.
        </p>
      </div>
      <ol aria-label="Scientific viewer asset and runtime pipeline" className="scientific-demo__architecture">
        {nodes.map((node, index) => (
          <li key={node}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function NeuralMorphologyVisualizer() {
  const startRef = useRef<HTMLElement>(null);
  const baselineRef = useRef<ViewerCanvasHandle>(null);
  const progressiveRef = useRef<ViewerCanvasHandle>(null);
  const [manifest, setManifest] = useState<ScientificViewerManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [structureStates, setStructureStates] = useState<StructureRegistry>({});
  const [selectedId, setSelectedId] = useState("");
  const [globalOpacity, setGlobalOpacity] = useState(0.82);
  const [quality, setQuality] = useState<ViewerQuality>("automatic");
  const [camerasLinked, setCamerasLinked] = useState(true);
  const camerasLinkedRef = useRef(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showPerformance, setShowPerformance] = useState(true);
  const [comparisonRun, setComparisonRun] = useState(0);
  const [cacheStatus, setCacheStatus] = useState("");
  const [baselineMetrics, setBaselineMetrics] = useState<ViewerMetrics>(() =>
    emptyMetrics("baseline"),
  );
  const [progressiveMetrics, setProgressiveMetrics] = useState<ViewerMetrics>(() =>
    emptyMetrics("progressive"),
  );

  useEffect(() => {
    if (hasStarted) return;
    const startPanel = startRef.current;
    if (!startPanel) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasStarted(true);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(startPanel);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let cancelled = false;
    void fetch(MANIFEST_URL, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error(`Manifest request failed with HTTP ${response.status}.`);
        return response.json();
      })
      .then((value) => {
        if (cancelled) return;
        const validated = validateManifest(value);
        setManifest(validated);
        setStructureStates(createStructureRegistry(validated));
        setSelectedId(
          validated.structures.find((structure) => structure.kind === "cell")?.id ??
            validated.structures[0].id,
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setManifestError(error instanceof Error ? error.message : "The scene manifest could not be loaded.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hasStarted]);

  useEffect(() => {
    camerasLinkedRef.current = camerasLinked;
  }, [camerasLinked]);

  const handleBaselinePose = useCallback((pose: CameraPose) => {
    if (camerasLinkedRef.current) progressiveRef.current?.applyCameraPose(pose);
  }, []);
  const handleProgressivePose = useCallback((pose: CameraPose) => {
    if (camerasLinkedRef.current) baselineRef.current?.applyCameraPose(pose);
  }, []);
  const handleBaselineMetrics = useCallback((metrics: ViewerMetrics) => {
    setBaselineMetrics(metrics);
  }, []);
  const handleProgressiveMetrics = useCallback((metrics: ViewerMetrics) => {
    setProgressiveMetrics(metrics);
  }, []);

  const selectedStructure = useMemo(
    () => manifest?.structures.find((structure) => structure.id === selectedId),
    [manifest, selectedId],
  );

  const updateDisplayState = useCallback(
    (structureId: string, patch: Parameters<typeof updateStructure>[2]) => {
      setStructureStates((current) => updateStructure(current, structureId, patch));
    },
    [],
  );

  const resetColors = () => {
    if (!manifest) return;
    setStructureStates((current) =>
      Object.fromEntries(
        manifest.structures.map((structure) => [
          structure.id,
          { ...current[structure.id], color: structure.defaultColor },
        ]),
      ),
    );
  };

  const resetCamera = () => {
    baselineRef.current?.frameAll();
    progressiveRef.current?.frameAll();
  };

  const clearApplicationCache = () => {
    baselineRef.current?.clearCache();
    progressiveRef.current?.clearCache();
    setCacheStatus("Both in-memory asset caches were cleared. Active scene meshes remain visible.");
  };

  const startColdComparison = () => {
    baselineRef.current?.clearCache();
    progressiveRef.current?.clearCache();
    setQuality("automatic");
    setBaselineMetrics(emptyMetrics("baseline"));
    setProgressiveMetrics(emptyMetrics("progressive"));
    setCacheStatus("Cold comparison restarted with fresh application caches and automatic quality.");
    setComparisonRun((current) => current + 1);
  };

  const focusStructure = (structureId: string) => {
    setSelectedId(structureId);
    updateDisplayState(structureId, { visible: true });
    window.requestAnimationFrame(() => {
      baselineRef.current?.frameStructure(structureId);
      progressiveRef.current?.frameStructure(structureId);
    });
  };

  const soloStructure = (structureId: string) => {
    setStructureStates((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, state]) => [
          id,
          { ...state, visible: id === structureId },
        ]),
      ),
    );
    focusStructure(structureId);
  };

  return (
    <article className="scientific-demo">
      <header className="scientific-demo__hero">
        <div>
          <span className="scientific-demo__kicker">Independent engineering demonstration</span>
          <h3>Progressive 3D Scientific Visualization</h3>
          <p>
            A non-proprietary Three.js recreation of performance and interaction patterns for complex neurological surface-mesh visualization.
          </p>
        </div>
        <div className="scientific-demo__hero-facts" aria-label="Demo facts">
          <span><Boxes aria-hidden="true" size={17} /> 3 layers · 7 cells</span>
          <span><Gauge aria-hidden="true" size={17} /> 4 precomputed LODs</span>
          <span>GLB · meshopt</span>
          {!hasStarted ? (
            <button
              className="scientific-demo__hero-start"
              onClick={() => setHasStarted(true)}
              type="button"
            >
              <Play aria-hidden="true" size={17} /> Start interactive comparison
            </button>
          ) : null}
        </div>
      </header>

      {!hasStarted ? (
        <section
          aria-label="Start interactive scientific visualization"
          className="scientific-demo__start"
          ref={startRef}
        >
          <span className="scientific-demo__kicker">Interactive demo paused</span>
          <h4>The live LOD comparison starts here</h4>
          <p>
            The Three.js renderers and GLB requests wait until this panel enters the viewport, keeping the case-study page light and the cold-start measurement tied to the moment you reach it. Use the start button above to launch it sooner.
          </p>
        </section>
      ) : manifestError ? (
        <div className="scientific-demo__fatal" role="alert">{manifestError}</div>
      ) : !manifest ? (
        <div className="scientific-demo__module-loading" role="status">
          <LoaderCircle aria-hidden="true" />
          <span>Loading the unified scene manifest…</span>
        </div>
      ) : (
        <>

      <aside className="scientific-demo__notice">
        <strong>Professional-work boundary</strong>
        <p>
          The original professional application used glTF and meshoptimizer. This independent demonstration recreates its performance and interaction patterns with non-proprietary assets.
        </p>
        <p>
          The original source code, institutional assets, neurological datasets, research results, and patient information are not reproduced. This mixed scene uses unrelated public H01 proofread cells plus cortical-layer surfaces extracted offline from a bounded public segmentation crop; the browser renders meshes, not a medical volume.
        </p>
      </aside>

      <section className="scientific-demo__comparison" aria-label="Baseline and progressive LOD comparison">
        <div className="scientific-demo__comparison-toolbar">
          <div>
            <span className="scientific-demo__kicker">Synchronized comparison</span>
            <h4>Full source startup vs. meshopt progressive LOD</h4>
          </div>
          <div className="scientific-demo__toolbar-actions">
            <button
              aria-pressed={camerasLinked}
              onClick={() => setCamerasLinked((current) => !current)}
              type="button"
            >
              {camerasLinked ? <Link2 aria-hidden="true" size={16} /> : <Link2Off aria-hidden="true" size={16} />}
              {camerasLinked ? "Cameras linked" : "Cameras unlinked"}
            </button>
            <button onClick={startColdComparison} type="button">
              <RefreshCcw aria-hidden="true" size={16} /> Run cold comparison
            </button>
          </div>
        </div>
        <div className="scientific-demo__viewer-grid" key={comparisonRun}>
          <section className="scientific-demo__viewer-card">
            <header>
              <div><span>Baseline</span><strong>Full source GLBs at startup</strong></div>
              <small>{formatTriangles(baselineMetrics.currentTriangles)} triangles</small>
            </header>
            <ViewerCanvas
              autoRotate={autoRotate}
              className="scientific-demo__canvas"
              globalOpacity={globalOpacity}
              label="Baseline Three.js viewer loading original full-resolution source GLBs at startup"
              manifest={manifest}
              mode="baseline"
              onCameraPose={handleBaselinePose}
              onMetrics={handleBaselineMetrics}
              quality="high"
              ref={baselineRef}
              selectedId={selectedId}
              structureStates={structureStates}
            />
            <p>Requests the two original public full-resolution source GLBs immediately. The renderer is not delayed or deliberately made inefficient.</p>
          </section>
          <section className="scientific-demo__viewer-card scientific-demo__viewer-card--progressive">
            <header>
              <div><span>Progressive LOD</span><strong>Packed coarse scene first</strong></div>
              <small>{formatTriangles(progressiveMetrics.currentTriangles)} triangles</small>
            </header>
            <ViewerCanvas
              autoRotate={autoRotate}
              className="scientific-demo__canvas"
              globalOpacity={globalOpacity}
              label="Optimized Three.js viewer progressively loading four GLB levels of detail"
              manifest={manifest}
              mode="progressive"
              onCameraPose={handleProgressivePose}
              onMetrics={handleProgressiveMetrics}
              quality={quality}
              ref={progressiveRef}
              selectedId={selectedId}
              structureStates={structureStates}
            />
            <p>Commits one packed meshopt LOD 0 scene, then requests individual detail only after camera movement, selection, framing, or a manual quality change. Loaded LODs stay cached for reuse.</p>
          </section>
        </div>
      </section>

      {showPerformance ? (
        <MetricsPanel baseline={baselineMetrics} progressive={progressiveMetrics} />
      ) : null}

      <section className="scientific-demo__workspace">
        <div className="scientific-demo__workspace-heading">
          <div>
            <span className="scientific-demo__kicker">Unified scene registry</span>
            <h4>Inspect structures without replacing the scene</h4>
          </div>
          <p aria-live="polite">{cacheStatus}</p>
        </div>

        <div className="scientific-demo__global-controls" aria-label="Global visualization controls">
          <button onClick={() => setStructureStates((current) => setAllVisibility(current, true))} type="button">
            <Eye aria-hidden="true" size={16} /> Show all
          </button>
          <button onClick={() => setStructureStates((current) => setAllVisibility(current, false))} type="button">
            <EyeOff aria-hidden="true" size={16} /> Hide all
          </button>
          <label>
            <span>Global opacity <output>{Math.round(globalOpacity * 100)}%</output></span>
            <input
              aria-label="Global structure opacity"
              max="1"
              min="0.1"
              onChange={(event) => setGlobalOpacity(Number(event.target.value))}
              step="0.05"
              type="range"
              value={globalOpacity}
            />
          </label>
          <label>
            <span>Progressive quality</span>
            <select onChange={(event) => setQuality(event.target.value as ViewerQuality)} value={quality}>
              <option value="automatic">Automatic</option>
              <option value="low">Low · LOD 0</option>
              <option value="balanced">Balanced · LOD 2</option>
              <option value="high">High · LOD 3</option>
            </select>
          </label>
          <button onClick={resetColors} type="button"><RefreshCcw aria-hidden="true" size={16} /> Reset colors</button>
          <button onClick={resetCamera} type="button"><RotateCcw aria-hidden="true" size={16} /> Reset camera</button>
          <button onClick={clearApplicationCache} type="button"><Trash2 aria-hidden="true" size={16} /> Clear cache</button>
          <button aria-pressed={showPerformance} onClick={() => setShowPerformance((current) => !current)} type="button">
            <Gauge aria-hidden="true" size={16} /> Performance
          </button>
          <button aria-pressed={autoRotate} onClick={() => setAutoRotate((current) => !current)} type="button">
            {autoRotate ? <Pause aria-hidden="true" size={16} /> : <Play aria-hidden="true" size={16} />}
            Auto-rotate
          </button>
        </div>

        <div className="scientific-demo__structure-list">
          {manifest.structures.map((structure) => {
            const state = structureStates[structure.id];
            const runtime = progressiveMetrics.structures[structure.id];
            if (!state) return null;
            return (
              <article data-selected={selectedId === structure.id} key={structure.id}>
                <div className="scientific-demo__structure-title">
                  <label>
                    <input
                      checked={state.visible}
                      onChange={(event) => updateDisplayState(structure.id, { visible: event.target.checked })}
                      type="checkbox"
                    />
                    <span aria-hidden="true" style={{ backgroundColor: state.color }} />
                    <strong>{structure.name}</strong>
                  </label>
                  <span className="scientific-demo__lod-status">
                    {runtime?.loading ? <LoaderCircle aria-hidden="true" size={13} /> : null}
                    {runtime?.error
                      ? "Load error"
                      : `LOD ${runtime?.currentLod ?? "—"} · cached ${runtime?.highestDownloadedLod ?? "—"} · ${formatCompactTriangles(runtime?.triangleCount ?? 0)} tris · ${formatBytes(runtime?.transferSize ?? 0)}`}
                  </span>
                </div>
                <div className="scientific-demo__structure-controls">
                  <label className="scientific-demo__color-control">
                    <span className="sr-only">{structure.name} color</span>
                    <input
                      aria-label={`${structure.name} color`}
                      onChange={(event) => updateDisplayState(structure.id, { color: event.target.value })}
                      type="color"
                      value={state.color}
                    />
                  </label>
                  <label className="scientific-demo__opacity-control">
                    <span>Opacity <output>{Math.round(state.opacity * 100)}%</output></span>
                    <input
                      aria-label={`${structure.name} opacity`}
                      max="1"
                      min="0.05"
                      onChange={(event) => updateDisplayState(structure.id, { opacity: Number(event.target.value) })}
                      step="0.05"
                      type="range"
                      value={state.opacity}
                    />
                  </label>
                  <button onClick={() => focusStructure(structure.id)} type="button"><Focus aria-hidden="true" size={14} /> Focus</button>
                  <button onClick={() => soloStructure(structure.id)} type="button">Solo</button>
                </div>
                {runtime?.error ? <p role="alert">{runtime.error}</p> : null}
              </article>
            );
          })}
        </div>
        <p className="scientific-demo__selection" aria-live="polite">
          Selected: <strong>{selectedStructure?.name}</strong>. Pointer drag rotates, right-drag pans, wheel or pinch zooms, <kbd>Home</kbd> frames the dataset, and <kbd>+</kbd>/<kbd>−</kbd> zoom.
        </p>
      </section>

      <ArchitectureDiagram />

      <section className="scientific-demo__technical-grid">
        <article>
          <span className="scientific-demo__kicker">Technical approach</span>
          <h4>Precompute, stream, reuse</h4>
          <p>glTF-Transform invokes meshoptimizer offline to simplify, reorder, quantize, and compress each surface mesh. It also packs the ten coarse meshes into one named-node bootstrap GLB. At runtime, one Promise-aware cache prevents duplicate fetches and retains parsed geometry while stable structure containers swap fully loaded LODs.</p>
        </article>
        <article>
          <span className="scientific-demo__kicker">Tradeoffs</span>
          <h4>Fast repeat navigation costs memory</h4>
          <p>The initial camera leaves the packed coarse scene intact; promotion begins only with real user demand. Retaining requested levels makes repeat navigation immediate, while clearing the cache lowers memory use. Translucent materials disable depth writing below near-opaque values, which avoids common self-occlusion artifacts but cannot perfectly sort every overlapping transparent surface.</p>
        </article>
        <article>
          <span className="scientific-demo__kicker">Professional contribution</span>
          <h4>Original category of work</h4>
          <p>The professional engagement involved glTF, meshoptimizer, dataset-load performance, material and visibility states, and camera interaction inside an existing neurological visualization application. Proprietary implementation details and research assets remain excluded.</p>
        </article>
        <article>
          <span className="scientific-demo__kicker">Public recreation</span>
          <h4>Independently written evidence</h4>
          <p>This repository demonstrates the same engineering category with public surface geometry: deterministic offline LOD generation, progressive network loading, explicit cache behavior, a unified manifest, instrumentation, and accessible controls.</p>
        </article>
      </section>

      <footer className="scientific-demo__credits">
        <div>
          <strong>Open-source acknowledgements</strong>
          <p>Mesh optimization uses meshoptimizer, Copyright © 2016–2026 Arseny Kapoulkine, licensed under the MIT License. Asset processing uses glTF-Transform, licensed under the MIT License.</p>
          <p>Public demonstration geometry: H01 proofread reconstructions and cortical-layer labels, CC BY 4.0. Layer names follow the source metadata; colors are interface encodings, not medical classifications.</p>
        </div>
        <div>
          <a href={manifest.dataset.sourcePage} rel="noreferrer" target="_blank">H01 source</a>
          <a href={manifest.dataset.publication} rel="noreferrer" target="_blank">Publication</a>
          <a href={manifest.dataset.licenseUrl} rel="noreferrer" target="_blank">CC BY 4.0</a>
          <a href="https://github.com/zeux/meshoptimizer" rel="noreferrer" target="_blank">meshoptimizer</a>
          <a href="https://gltf-transform.dev/" rel="noreferrer" target="_blank">glTF-Transform</a>
        </div>
      </footer>
        </>
      )}
    </article>
  );
}
