"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { BrowserFrame } from "@/components/demos/BrowserFrame";

const carouselImages = [
  { src: "/images/cats-live/cats-image-2.webp", width: 720, height: 840 },
  { src: "/images/cats-live/tony-award-winner.webp", width: 720, height: 840 },
  { src: "/images/cats-live/cats-image-1.webp", width: 720, height: 840 },
  { src: "/images/cats-live/forever-45.webp", width: 720, height: 840 },
  { src: "/images/cats-live/website-photo-4.webp", width: 720, height: 840 },
  { src: "/images/cats-live/hero-car-1.webp", width: 720, height: 840 },
  { src: "/images/cats-live/crown.webp", width: 720, height: 840 },
  { src: "/images/cats-live/best-reviewed.webp", width: 720, height: 840 },
  { src: "/images/cats-live/website-photo-3.webp", width: 720, height: 840 },
  { src: "/images/cats-live/hero-car-2.webp", width: 720, height: 840 },
];

function CatsMarquee({ paused }: { paused: boolean }) {
  const repeatedImages = [...carouselImages, ...carouselImages];

  return (
    <div className="cats-marquee-outer" role="region" aria-label="Image Carousel">
      <div className={`cats-marquee-track ${paused ? "cats-marquee-track--paused" : ""}`}>
        {repeatedImages.map((image, index) => (
          <Image
            alt=""
            aria-hidden="true"
            height={image.height}
            key={`${image.src}-${index}`}
            sizes="310px"
            src={image.src}
            width={image.width}
          />
        ))}
      </div>
    </div>
  );
}

export function CatsCarouselDemo({ compact = false }: { compact?: boolean }) {
  const [marqueePaused, setMarqueePaused] = useState(false);
  const demo = (
    <div className="cats-stage">
      <div className="cats-live-site">
        <header className="cats-live-nav">
          <span className="cats-live-menu" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <Image
            alt="CATS: The Jellicle Ball"
            className="cats-live-logo"
            height={88}
            sizes="(max-width: 760px) 200px, 300px"
            src="/images/cats-live/cats-web-logo.webp"
            width={600}
          />
          <span aria-label="Ticketing link omitted from archived demo" className="cats-live-ticket" title="Ticketing link omitted from archived demo">
            Tickets
          </span>
        </header>

        <section className="cats-live-hero" aria-label="CATS hero layout demo">
          <div className="cats-live-quote-panel">
            <Image
              alt=""
              aria-hidden="true"
              className="cats-live-disco"
              height={2154}
              sizes="(max-width: 760px) 45vw, 28vw"
              src="/images/cats-live/disco-ball-string.webp"
              width={1089}
            />
            <Image
              alt="Critical quote artwork"
              className="cats-live-wide-quote"
              height={771}
              sizes="(max-width: 760px) 90vw, 44vw"
              src="/images/cats-live/new-quote-1.webp"
              width={1671}
            />
          </div>
          <div className="cats-live-art-panel">
            <Image
              alt="CATS Jellicle Ball title artwork"
              className="cats-live-combo"
              height={1363}
              sizes="(max-width: 760px) 90vw, 44vw"
              src="/images/cats-live/cats-combo.webp"
              width={1671}
            />
            <Image
              alt=""
              aria-hidden="true"
              className="cats-live-side-quote"
              height={2099}
              sizes="(max-width: 760px) 42vw, 20vw"
              src="/images/cats-live/quote-cats-new.webp"
              width={1671}
            />
          </div>
        </section>

        <section className="cats-live-calendar-band" aria-label="CATS performance callout">
          <h3>Archived production snapshot</h3>
          <p>Interaction and visual direction preserved from the implementation period</p>
        </section>

        <section className="cats-live-marquee-section" aria-label="CATS carousel demo">
          <button
            aria-label={marqueePaused ? "Play carousel animation" : "Pause carousel animation"}
            className="cats-marquee-control"
            onClick={() => setMarqueePaused((paused) => !paused)}
            type="button"
          >
            {marqueePaused ? <Play aria-hidden="true" size={15} /> : <Pause aria-hidden="true" size={15} />}
            {marqueePaused ? "Play" : "Pause"}
          </button>
          <CatsMarquee paused={marqueePaused} />
        </section>

        <section className="cats-live-video-grid" aria-label="CATS media layout demo">
          <article>
            <h4>Forever. And Now.</h4>
            <Image alt="CATS video thumbnail" height={575} sizes="(max-width: 760px) 100vw, 45vw" src="/images/cats-live/video-thumbnail-1.webp" width={1024} />
          </article>
          <article>
            <h4>Tony Awards Performance</h4>
            <Image
              alt="Tony Awards performance thumbnail"
              height={575}
              sizes="(max-width: 760px) 100vw, 45vw"
              src="/images/cats-live/tony-video-cats.webp"
              width={1024}
            />
          </article>
        </section>

        <div className="cats-live-footer-mark">
          <Image alt="CATS logo" height={158} sizes="(max-width: 760px) 60vw, 420px" src="/images/cats-live/cats-logo-yellow.webp" width={1024} />
        </div>
      </div>
    </div>
  );

  if (compact) {
    return demo;
  }

  return <BrowserFrame urlLabel="portfolio evidence / cats-carousel">{demo}</BrowserFrame>;
}
