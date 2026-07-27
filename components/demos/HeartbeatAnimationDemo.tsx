"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { HeartWaveCanvas } from "@/components/demos/HeartWaveCanvas";
import { HeartProjectVisual } from "@/components/work/HeartProjectVisual";

export function HeartbeatAnimationDemo() {
  const [playing, setPlaying] = useState(true);

  return (
    <section className="heart-demo" aria-label="The Heart motion demo">
      <div className="heart-demo__toolbar">
        <span>The Heart / live homepage study</span>
        <button
          aria-label={playing ? "Pause heartbeat animation" : "Play heartbeat animation"}
          className="icon-button"
          onClick={() => setPlaying((value) => !value)}
          title={playing ? "Pause" : "Play"}
          type="button"
        >
          {playing ? <Pause aria-hidden="true" size={18} /> : <Play aria-hidden="true" size={18} />}
        </button>
      </div>
      <div className="heart-demo__hero">
        <HeartProjectVisual accessible playing={playing} priority variant="demo" />
      </div>
      <HeartWaveCanvas playing={playing} />
    </section>
  );
}
