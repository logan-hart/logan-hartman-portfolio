type VideoFallbackProps = {
  src?: string;
  label?: string;
};

export function VideoFallback({ src, label = "Screen recording fallback" }: VideoFallbackProps) {
  if (src) {
    return (
      <video className="video-fallback" controls muted playsInline preload="metadata">
        <source src={src} />
      </video>
    );
  }

  return (
    <div className="video-fallback" role="note">
      {label} can be added here as an MP4 or WebM asset when an interaction is too specific to recreate safely.
    </div>
  );
}
