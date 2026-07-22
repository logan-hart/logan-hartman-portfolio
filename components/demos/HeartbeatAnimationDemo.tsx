"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { HeartWaveCanvas } from "@/components/demos/HeartWaveCanvas";

export function HeartbeatAnimationDemo() {
  const [playing, setPlaying] = useState(true);

  return (
    <section className="heart-demo" aria-label="The Heart motion demo">
      <div className="heart-demo__toolbar">
        <span>The Heart / original CodePen study</span>
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
        <div className="heart-demo__globe" style={{ animationPlayState: playing ? "running" : "paused" }}>
          <Image
            alt="The Heart point-cloud globe from the original CodePen"
            height={800}
            priority
            src="/images/the-heart/heart-globe-codepen.png"
            width={803}
          />
        </div>
        <h3>
          THE
          <br />
          HEART
        </h3>
        <span aria-hidden="true" className="heart-demo__vignette" />
      </div>
      <div className="heart-demo__wave">
        <HeartWaveCanvas playing={playing} />
        <div className="heart-copy">
          <span>Pulse in motion</span>
          <p>Original point-wave palette and heartbeat rhythm, adapted from Logan Hart&apos;s CodePen studies.</p>
        </div>
      </div>
    </section>
  );
}
