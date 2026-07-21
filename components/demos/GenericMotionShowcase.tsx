"use client";

import { useState } from "react";
import { BrowserFrame } from "@/components/demos/BrowserFrame";

const modes = [
  { key: "stagger", label: "Stagger" },
  { key: "reveal", label: "Reveal" },
  { key: "path", label: "Path" },
] as const;

export function GenericMotionShowcase() {
  const [mode, setMode] = useState<(typeof modes)[number]["key"]>("stagger");

  return (
    <BrowserFrame urlLabel="portfolio demo / motion-showcase">
      <div className="demo-panel">
        <div className="motion-showcase">
          <div>
            <div className="category">Interaction system</div>
            <h3>Patterns that explain hierarchy</h3>
            <p>
              A compact module for showing reveal, sequence, and path behavior without copying proprietary page
              structure or production content.
            </p>
            <div aria-label="Motion mode" className="motion-tabs" role="tablist">
              {modes.map((item) => (
                <button
                  aria-selected={item.key === mode}
                  key={item.key}
                  onClick={() => setMode(item.key)}
                  role="tab"
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div aria-label={`${mode} motion preview`} className="motion-canvas" data-mode={mode}>
            <span className="motion-item" />
            <span className="motion-item" />
            <span className="motion-item" />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
