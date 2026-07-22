"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
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

const buzzQuotes = [
  { stars: "★★★★", quote: "A raucous success!", outlet: "The New York Post" },
  { quote: "A lightning strike!", outlet: "The New York Times" },
  { quote: "Paris is purring.", outlet: "Time Out New York" },
];

const buzzFeatures = [
  {
    alt: "CATS: The Jellicle Ball performs on Good Morning America",
    date: "April 21, 2026",
    headline: "Cats: The Jellicle Ball performs on GMA",
    image: "/images/cats-live/cats-buzz-gma.webp",
    imageHeight: 400,
    imageWidth: 336,
    outlet: "Good Morning America",
    outletHeight: 30,
    outletImage: "/images/cats-live/cats-outlet-gma.webp",
    outletWidth: 336,
  },
  {
    alt: "CATS: The Jellicle Ball company onstage",
    date: "April 17, 2026",
    headline: "For the Team Behind Cats: The Jellicle Ball, Bringing Ballroom to Broadway Is Personal",
    image: "/images/cats-live/cats-buzz-them.webp",
    imageHeight: 400,
    imageWidth: 336,
    outlet: "them",
    outletHeight: 34,
    outletImage: "/images/cats-live/cats-outlet-them.webp",
    outletWidth: 104,
  },
  {
    alt: "André De Shields performing in CATS: The Jellicle Ball",
    date: "April 15, 2025",
    headline: "A reimagined ‘Cats’ on Broadway features a special cat — an actor from the original 1980s musical",
    image: "/images/cats-live/cats-buzz-ap.webp",
    imageHeight: 1024,
    imageWidth: 650,
    outlet: "Associated Press",
    outletHeight: 30,
    outletImage: "/images/cats-live/cats-outlet-ap.webp",
    outletWidth: 336,
  },
  {
    alt: "CATS: The Jellicle Ball rehearsal footage",
    date: "April 14, 2026",
    headline: "Broadway meets the runway in the retelling of ‘Cats’",
    image: "/images/cats-live/cats-buzz-morning-joe.webp",
    imageHeight: 400,
    imageWidth: 336,
    outlet: "Morning Joe",
    outletHeight: 30,
    outletImage: "/images/cats-live/cats-outlet-morning-joe.webp",
    outletWidth: 336,
  },
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
  const [buzzTickerPaused, setBuzzTickerPaused] = useState(false);
  const buzzFeatureTrack = useRef<HTMLDivElement>(null);

  const scrollBuzzFeatures = (direction: -1 | 1) => {
    const track = buzzFeatureTrack.current;
    if (!track) return;
    track.scrollBy({ behavior: "smooth", left: direction * Math.max(260, track.clientWidth * 0.72) });
  };
  const demo = (
    <div className="cats-stage">
      <div className="cats-live-site">
        <header className="cats-live-nav">
          <span className="cats-live-menu" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <strong className="cats-live-closing">Final performance August 8</strong>
          <span aria-label="Ticketing link omitted from archived demo" className="cats-live-ticket" title="Ticketing link omitted from archived demo">
            Tickets
          </span>
        </header>

        <section className="cats-live-hero" aria-label="CATS homepage hero recreation">
          <Image
            alt="Critical quote artwork"
            className="cats-live-home-quote"
            height={2099}
            sizes="(max-width: 760px) 58vw, 32vw"
            src="/images/cats-live/quote-cats-new.webp"
            width={1671}
          />
          <Image
            alt=""
            aria-hidden="true"
            className="cats-live-home-disco"
            height={2154}
            sizes="(max-width: 760px) 54vw, 31vw"
            src="/images/cats-live/disco-ball-string.webp"
            width={1089}
          />
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

        <section className="cats-live-buzz" aria-label="The Buzz editorial system">
          <div className="cats-live-buzz-masthead">
            <Image
              alt="The Buzz"
              className="cats-live-buzz-hero cats-live-buzz-hero--desktop"
              height={753}
              sizes="100vw"
              src="/images/cats-live/cats-buzz-hero.webp"
              width={1692}
            />
            <Image
              alt="The Buzz"
              className="cats-live-buzz-hero cats-live-buzz-hero--mobile"
              height={753}
              sizes="100vw"
              src="/images/cats-live/cats-buzz-hero-mobile.webp"
              width={700}
            />
          </div>

          <div className="cats-live-buzz-ticker" aria-label="Animated press quotes">
            <div className="cats-live-buzz-ticker-viewport">
              <div className={`cats-live-buzz-ticker-track ${buzzTickerPaused ? "cats-live-buzz-ticker-track--paused" : ""}`}>
                {[0, 1].map((setIndex) => (
                  <div aria-hidden={setIndex === 1} className="cats-live-buzz-ticker-group" key={setIndex}>
                    {buzzQuotes.map((quote) => (
                      <span className="cats-live-buzz-ticker-item" key={`${setIndex}-${quote.quote}`}>
                        {quote.stars ? <b aria-label="Four stars">{quote.stars}</b> : null}
                        <strong>“{quote.quote}”</strong>
                        <small>—{quote.outlet}</small>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button
              aria-label={buzzTickerPaused ? "Play press quote carousel" : "Pause press quote carousel"}
              className="cats-live-buzz-ticker-control"
              onClick={() => setBuzzTickerPaused((paused) => !paused)}
              type="button"
            >
              {buzzTickerPaused ? <Play aria-hidden="true" size={15} /> : <Pause aria-hidden="true" size={15} />}
              <span>{buzzTickerPaused ? "Play" : "Pause"}</span>
            </button>
          </div>

          <div className="cats-live-buzz-features" aria-label="Press feature carousel">
            <button aria-label="Previous press features" className="cats-live-buzz-feature-arrow cats-live-buzz-feature-arrow--previous" onClick={() => scrollBuzzFeatures(-1)} type="button">
              <ChevronLeft aria-hidden="true" />
            </button>
            <div className="cats-live-buzz-grid" ref={buzzFeatureTrack}>
              {buzzFeatures.map((feature) => (
                <article key={feature.headline}>
                  <Image
                    alt={feature.alt}
                    className="cats-live-buzz-card-image"
                    height={feature.imageHeight}
                    sizes="(max-width: 760px) 82vw, 28vw"
                    src={feature.image}
                    width={feature.imageWidth}
                  />
                  <div className="cats-live-buzz-card-caption">
                    <strong>{feature.headline}</strong>
                    <time>{feature.date}</time>
                  </div>
                  <div className="cats-live-buzz-outlet">
                    <Image alt={feature.outlet} height={feature.outletHeight} src={feature.outletImage} width={feature.outletWidth} />
                  </div>
                </article>
              ))}
            </div>
            <button aria-label="Next press features" className="cats-live-buzz-feature-arrow cats-live-buzz-feature-arrow--next" onClick={() => scrollBuzzFeatures(1)} type="button">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>

          <div className="cats-live-buzz-primary">
            <Image
              alt="CATS performer in black-and-white production portrait"
              height={873}
              sizes="100vw"
              src="/images/cats-live/cats-buzz-primary.webp"
              width={2073}
            />
          </div>
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

        <section className="cats-live-meow" aria-label="MEOW production artwork">
          <Image alt="MEOW" height={1246} sizes="100vw" src="/images/cats-live/cats-meow.webp" width={2560} />
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

  return <BrowserFrame>{demo}</BrowserFrame>;
}
