import Image from "next/image";

type HeartProjectVisualProps = {
  accessible?: boolean;
  playing?: boolean;
  priority?: boolean;
  variant?: "compact" | "demo" | "hero";
};

export function HeartProjectVisual({
  accessible,
  playing = true,
  priority = false,
  variant = "compact",
}: HeartProjectVisualProps) {
  const isAccessible = accessible ?? variant === "hero";
  const sizes =
    variant === "hero"
      ? "(max-width: 900px) 100vw, 44vw"
      : variant === "demo"
        ? "(max-width: 900px) 100vw, 900px"
        : "(max-width: 720px) 100vw, 36vw";

  return (
    <div
      aria-hidden={isAccessible ? undefined : true}
      aria-label={
        isAccessible
          ? "The Heart animated visual: a colorful point-cloud globe, purple waveform, and glowing title on black"
          : undefined
      }
      className={`heart-project-visual heart-project-visual--${variant}`}
      role={isAccessible ? "img" : undefined}
    >
      <span aria-hidden="true" className="heart-project-visual__wave">
        <Image
          alt=""
          height={800}
          priority={priority}
          sizes={sizes}
          src="/images/the-heart/heart-homepage-wave.png"
          width={1695}
        />
      </span>
      <span
        aria-hidden="true"
        className="heart-project-visual__globe"
        style={{ animationPlayState: playing ? "running" : "paused" }}
      >
        <Image
          alt=""
          height={800}
          priority={priority}
          sizes={sizes}
          src="/images/the-heart/heart-homepage-globe.png"
          width={803}
        />
      </span>
      <span
        aria-hidden="true"
        className="heart-project-visual__title"
        style={{ animationPlayState: playing ? "running" : "paused" }}
      >
        <span>THE</span>
        <span>HEART</span>
      </span>
      <span aria-hidden="true" className="heart-project-visual__vignette" />
    </div>
  );
}
