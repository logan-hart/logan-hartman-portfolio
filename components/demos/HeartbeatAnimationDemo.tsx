"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { BrowserFrame } from "@/components/demos/BrowserFrame";

export function HeartbeatAnimationDemo() {
  const [playing, setPlaying] = useState(true);

  return (
    <BrowserFrame urlLabel="portfolio demo / heartbeat">
      <div className="heart-demo" style={{ animationPlayState: playing ? "running" : "paused" }}>
        <div className="demo-toolbar">
          <span className="category">The Heart motion demo</span>
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
        <div className="heart-demo__grid">
          <div className="heart-demo__art" style={{ animationPlayState: playing ? "running" : "paused" }}>
            <Image alt="The Heart visual mark" height={1643} src="/images/the-heart/the-heart-mark.webp" width={1800} />
            <span aria-hidden="true" className="heart-mark" />
          </div>
          <div>
            <svg aria-hidden="true" className="heart-wave" viewBox="0 0 560 120">
              <polyline
                className="heart-wave__line"
                points="0,60 84,60 112,60 136,22 166,102 204,38 230,60 344,60 378,60 404,28 438,94 470,60 560,60"
                style={{ animationPlayState: playing ? "running" : "paused" }}
              />
            </svg>
            <div className="heart-copy">
              <strong>Pulse in motion</strong>
              <p>Heartbeat timing, waveform reveal, and theatrical rhythm preserved in a lightweight module.</p>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
